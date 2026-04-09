import { ErrorCodes } from '../error-codes';
import { AppException } from './app.exception';

export class ValidationException extends AppException {
  constructor(message: string, detail?: string) {
    super(ErrorCodes.VALIDATION_001, 400, message, detail);
  }
}

export class UnauthorizedException extends AppException {
  constructor(message: string, detail?: string) {
    super(ErrorCodes.AUTH_001, 401, message, detail);
  }
}

export class ForbiddenException extends AppException {
  constructor(message: string, detail?: string) {
    super(ErrorCodes.AUTH_002, 403, message, detail);
  }
}

export class NotFoundException extends AppException {
  constructor(message: string, detail?: string) {
    super(ErrorCodes.NOT_FOUND_001, 404, message, detail);
  }
}

export class ConflictException extends AppException {
  constructor(message: string, detail?: string) {
    super(ErrorCodes.CONFLICT_001, 409, message, detail);
  }
}
