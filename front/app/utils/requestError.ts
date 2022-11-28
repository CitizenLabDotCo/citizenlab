export class RequestError extends Error {
  statusCode?: number;

  constructor(message: string) {
    super(message);

    // 👇️ because we are extending a built-in class
    Object.setPrototypeOf(this, RequestError.prototype);
  }
}
