export class AppException extends Error {
  readonly code: string;
  readonly status: number;
  readonly detail?: string;

  constructor(code: string, status: number, message: string, detail?: string) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.status = status;
    this.detail = detail;
  }
}
