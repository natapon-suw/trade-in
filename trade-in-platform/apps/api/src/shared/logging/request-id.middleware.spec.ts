import { RequestIdMiddleware, REQUEST_ID_HEADER } from './request-id.middleware';
import { Request, Response } from 'express';

describe('RequestIdMiddleware', () => {
  let middleware: RequestIdMiddleware;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let nextFn: jest.Mock;

  beforeEach(() => {
    middleware = new RequestIdMiddleware();
    mockReq = { headers: {} };
    mockRes = { setHeader: jest.fn() };
    nextFn = jest.fn();
  });

  it('should generate a request ID when none is provided', () => {
    middleware.use(mockReq as Request, mockRes as Response, nextFn);

    const assignedId = mockReq.headers![REQUEST_ID_HEADER.toLowerCase()];
    expect(assignedId).toBeDefined();
    expect(typeof assignedId).toBe('string');
    expect((assignedId as string).length).toBeGreaterThan(0);
    expect(mockRes.setHeader).toHaveBeenCalledWith(
      REQUEST_ID_HEADER,
      assignedId,
    );
    expect((mockReq as any).requestId).toBe(assignedId);
    expect(nextFn).toHaveBeenCalled();
  });

  it('should preserve an existing X-Request-Id header', () => {
    const existingId = 'existing-request-id-123';
    mockReq.headers = { [REQUEST_ID_HEADER.toLowerCase()]: existingId };

    middleware.use(mockReq as Request, mockRes as Response, nextFn);

    expect(mockReq.headers[REQUEST_ID_HEADER.toLowerCase()]).toBe(existingId);
    expect((mockReq as any).requestId).toBe(existingId);
    expect(mockRes.setHeader).toHaveBeenCalledWith(
      REQUEST_ID_HEADER,
      existingId,
    );
    expect(nextFn).toHaveBeenCalled();
  });

  it('should set the request ID on the response header', () => {
    middleware.use(mockReq as Request, mockRes as Response, nextFn);

    const assignedId = (mockReq as any).requestId;
    expect(mockRes.setHeader).toHaveBeenCalledWith(
      REQUEST_ID_HEADER,
      assignedId,
    );
  });

  it('should call next()', () => {
    middleware.use(mockReq as Request, mockRes as Response, nextFn);
    expect(nextFn).toHaveBeenCalledTimes(1);
  });
});
