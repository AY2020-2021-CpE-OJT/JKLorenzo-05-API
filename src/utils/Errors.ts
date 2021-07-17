export class ExpectError extends Error {
  name = "ExpectError";

  constructor(message: string) {
    super(message);
    Error.captureStackTrace(this, ExpectError);
  }
}
