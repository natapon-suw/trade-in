export const ErrorCodes = {
  VALIDATION_001: 'VALIDATION_001',
  AUTH_001: 'AUTH_001',
  AUTH_002: 'AUTH_002',
  NOT_FOUND_001: 'NOT_FOUND_001',
  CONFLICT_001: 'CONFLICT_001',
  INTERNAL_001: 'INTERNAL_001',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
