export function isNullOrError(obj: any): obj is null | Error {
  return (obj === null || obj instanceof Error);
}
