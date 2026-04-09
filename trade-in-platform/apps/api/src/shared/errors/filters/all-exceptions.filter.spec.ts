import { AllExceptionsFilter } from './all-exceptions.filter';
import { AppException } from '../exceptions/app.exception';
import {
  ValidationException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '../exceptions/domain.exception';
import { ErrorCodes } from '../error-codes';
import { HttpException, HttpStatus, ArgumentsHost } from '@nestjs/common';

function createMockHost(
  url = '/test',
  requestId?: string,
): { host: ArgumentsHost; response: { status: jest.Mock; json: jest.Mock } } {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const headers: Record<string, string> = {};
  if (requestId) {
    headers['x-request-id'] = requestId;
  }

  const host = {
    switchToHttp: () => ({
      getResponse: () => ({ status, json }),
      getRequest: () => ({ url, headers }),
    }),
  } as unknown as ArgumentsHost;

  return { host, response: { status, json } };
}

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
  });

  describe('AppException handling', () => {
    it('should format AppException as RFC 7807', () => {
      const exception = new AppException(
        'CUSTOM_001',
        422,
        'Custom error',
        'Some detail',
      );
      const { host, response } = createMockHost('/api/test');

      filter.catch(exception, host);

      expect(response.status).toHaveBeenCalledWith(422);
      const body = response.json.mock.calls[0][0];
      expect(body).toMatchObject({
        type: 'https://api.trade-in.local/errors/custom-001',
        title: 'Custom error',
        status: 422,
        detail: 'Some detail',
        instance: '/api/test',
        code: 'CUSTOM_001',
      });
      expect(body.requestId).toBeDefined();
    });

    it('should omit detail when not provided', () => {
      const exception = new AppException('TEST_001', 400, 'No detail');
      const { host, response } = createMockHost();

      filter.catch(exception, host);

      const body = response.json.mock.calls[0][0];
      expect(body.detail).toBeUndefined();
    });
  });

  describe('NestJS HttpException handling', () => {
    it('should map HttpException 400 to VALIDATION_001', () => {
      const exception = new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
      const { host, response } = createMockHost();

      filter.catch(exception, host);

      expect(response.status).toHaveBeenCalledWith(400);
      const body = response.json.mock.calls[0][0];
      expect(body.code).toBe(ErrorCodes.VALIDATION_001);
      expect(body.title).toBe('Bad Request');
      expect(body.status).toBe(400);
    });

    it('should map HttpException 401 to AUTH_001', () => {
      const exception = new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      const { host, response } = createMockHost();

      filter.catch(exception, host);

      const body = response.json.mock.calls[0][0];
      expect(body.code).toBe(ErrorCodes.AUTH_001);
      expect(body.status).toBe(401);
    });

    it('should map HttpException 403 to AUTH_002', () => {
      const exception = new HttpException('Forbidden', HttpStatus.FORBIDDEN);
      const { host, response } = createMockHost();

      filter.catch(exception, host);

      const body = response.json.mock.calls[0][0];
      expect(body.code).toBe(ErrorCodes.AUTH_002);
      expect(body.status).toBe(403);
    });

    it('should map HttpException 404 to NOT_FOUND_001', () => {
      const exception = new HttpException('Not Found', HttpStatus.NOT_FOUND);
      const { host, response } = createMockHost();

      filter.catch(exception, host);

      const body = response.json.mock.calls[0][0];
      expect(body.code).toBe(ErrorCodes.NOT_FOUND_001);
      expect(body.status).toBe(404);
    });

    it('should map HttpException 409 to CONFLICT_001', () => {
      const exception = new HttpException('Conflict', HttpStatus.CONFLICT);
      const { host, response } = createMockHost();

      filter.catch(exception, host);

      const body = response.json.mock.calls[0][0];
      expect(body.code).toBe(ErrorCodes.CONFLICT_001);
      expect(body.status).toBe(409);
    });

    it('should map unmapped HttpException status to INTERNAL_001', () => {
      const exception = new HttpException('Teapot', 418);
      const { host, response } = createMockHost();

      filter.catch(exception, host);

      expect(response.status).toHaveBeenCalledWith(418);
      const body = response.json.mock.calls[0][0];
      expect(body.code).toBe(ErrorCodes.INTERNAL_001);
    });

    it('should extract message from object response', () => {
      const exception = new HttpException(
        { message: 'Validation failed', statusCode: 400 },
        HttpStatus.BAD_REQUEST,
      );
      const { host, response } = createMockHost();

      filter.catch(exception, host);

      const body = response.json.mock.calls[0][0];
      expect(body.title).toBe('Validation failed');
    });
  });

  describe('unknown error handling', () => {
    it('should return 500 with INTERNAL_001 for unknown errors', () => {
      const exception = new Error('Something broke');
      const { host, response } = createMockHost('/api/broken');

      filter.catch(exception, host);

      expect(response.status).toHaveBeenCalledWith(500);
      const body = response.json.mock.calls[0][0];
      expect(body).toMatchObject({
        type: 'https://api.trade-in.local/errors/internal-001',
        title: 'Internal Server Error',
        status: 500,
        instance: '/api/broken',
        code: ErrorCodes.INTERNAL_001,
      });
    });

    it('should return 500 for non-Error thrown values', () => {
      const { host, response } = createMockHost();

      filter.catch('string error', host);

      expect(response.status).toHaveBeenCalledWith(500);
      const body = response.json.mock.calls[0][0];
      expect(body.code).toBe(ErrorCodes.INTERNAL_001);
    });
  });

  describe('requestId handling', () => {
    it('should use X-Request-Id header when present', () => {
      const exception = new AppException('TEST_001', 400, 'Test');
      const { host, response } = createMockHost('/test', 'my-request-id-123');

      filter.catch(exception, host);

      const body = response.json.mock.calls[0][0];
      expect(body.requestId).toBe('my-request-id-123');
    });

    it('should generate a UUID when X-Request-Id header is missing', () => {
      const exception = new AppException('TEST_001', 400, 'Test');
      const { host, response } = createMockHost();

      filter.catch(exception, host);

      const body = response.json.mock.calls[0][0];
      expect(body.requestId).toBeDefined();
      expect(body.requestId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });
  });

  describe('domain exceptions', () => {
    it('should format ValidationException correctly', () => {
      const exception = new ValidationException('Invalid input', 'Field X is required');
      const { host, response } = createMockHost();

      filter.catch(exception, host);

      expect(response.status).toHaveBeenCalledWith(400);
      const body = response.json.mock.calls[0][0];
      expect(body.code).toBe(ErrorCodes.VALIDATION_001);
      expect(body.title).toBe('Invalid input');
      expect(body.detail).toBe('Field X is required');
    });

    it('should format UnauthorizedException correctly', () => {
      const exception = new UnauthorizedException('Invalid token');
      const { host, response } = createMockHost();

      filter.catch(exception, host);

      expect(response.status).toHaveBeenCalledWith(401);
      const body = response.json.mock.calls[0][0];
      expect(body.code).toBe(ErrorCodes.AUTH_001);
    });

    it('should format ForbiddenException correctly', () => {
      const exception = new ForbiddenException('Access denied');
      const { host, response } = createMockHost();

      filter.catch(exception, host);

      expect(response.status).toHaveBeenCalledWith(403);
      const body = response.json.mock.calls[0][0];
      expect(body.code).toBe(ErrorCodes.AUTH_002);
    });

    it('should format NotFoundException correctly', () => {
      const exception = new NotFoundException('User not found');
      const { host, response } = createMockHost();

      filter.catch(exception, host);

      expect(response.status).toHaveBeenCalledWith(404);
      const body = response.json.mock.calls[0][0];
      expect(body.code).toBe(ErrorCodes.NOT_FOUND_001);
    });

    it('should format ConflictException correctly', () => {
      const exception = new ConflictException('Duplicate entry');
      const { host, response } = createMockHost();

      filter.catch(exception, host);

      expect(response.status).toHaveBeenCalledWith(409);
      const body = response.json.mock.calls[0][0];
      expect(body.code).toBe(ErrorCodes.CONFLICT_001);
    });
  });

  describe('RFC 7807 compliance', () => {
    it('should include all required RFC 7807 fields', () => {
      const exception = new ValidationException('Bad data', 'Missing field');
      const { host, response } = createMockHost('/api/resource', 'req-123');

      filter.catch(exception, host);

      const body = response.json.mock.calls[0][0];
      expect(body).toHaveProperty('type');
      expect(body).toHaveProperty('title');
      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('instance');
      expect(body).toHaveProperty('code');
      expect(body).toHaveProperty('requestId');
      expect(typeof body.type).toBe('string');
      expect(typeof body.title).toBe('string');
      expect(typeof body.status).toBe('number');
    });
  });
});
