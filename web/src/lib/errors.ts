// A small application error that carries an HTTP status code.
// The HTTP layer (route handlers) turns this into a JSON response.
export class AppError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "AppError";
  }
}
