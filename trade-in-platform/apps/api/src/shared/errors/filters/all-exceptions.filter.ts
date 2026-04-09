import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Response, Request } from 'express';
import { AppError } from '../../types/error.types';
import { AppException } from '../exceptions/app.exception';
import { ErrorCodes } from '../error-codes';

const HTTP_STATUS_TO_ERROR_CODE: Record<number, string> = {
  400: ErrorCodes.VALIDATION_001,
  401: ErrorCodes.AUTH_001,
  403: ErrorCodes.AUTH_002,
  404: ErrorCodes.NOT_FOUND_001,
  409: ErrorCodes.CONFLICT_001,
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const requestId =
      (request.headers['x-request-id'] as string) || randomUUID();

    const body = this.buildErrorResponse(exception, request, requestId);

    response.status(body.status).json(body);
  }

  private buildErrorResponse(
    exception: unknown,
    request: Request,
    requestId: string,
  ): AppError {
    if (exception instanceof AppException) {
      return this.fromAppException(exception, request, requestId);
    }

    if (exception instanceof HttpException) {
      return this.fromHttpException(exception, request, requestId);
    }

    return this.fromUnknownError(request, requestId);
  }

  private fromAppException(
    exception: AppException,
    request: Request,
    requestId: string,
  ): AppError {
    return {
      type: `https://api.trade-in.local/errors/${exception.code.toLowerCase().replace(/_/g, '-')}`,
      title: exception.message,
      status: exception.status,
      detail: exception.detail,
      instance: request.url,
      code: exception.code,
      requestId,
    };
  }

  private fromHttpException(
    exception: HttpException,
    request: Request,
    requestId: string,
  ): AppError {
    const status = exception.getStatus();
    const code =
      HTTP_STATUS_TO_ERROR_CODE[status] || ErrorCodes.INTERNAL_001;

    const exceptionResponse = exception.getResponse();
    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as Record<string, unknown>).message?.toString() ||
          exception.message;

    return {
      type: `https://api.trade-in.local/errors/${code.toLowerCase().replace(/_/g, '-')}`,
      title: message,
      status,
      instance: request.url,
      code,
      requestId,
    };
  }

  private fromUnknownError(request: Request, requestId: string): AppError {
    return {
      type: 'https://api.trade-in.local/errors/internal-001',
      title: 'Internal Server Error',
      status: 500,
      instance: request.url,
      code: ErrorCodes.INTERNAL_001,
      requestId,
    };
  }
}
