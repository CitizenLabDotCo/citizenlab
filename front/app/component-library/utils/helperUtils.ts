export function isNilOrError(obj: any): obj is undefined | null | Error {
  return obj === undefined || obj === null || obj instanceof Error;
}
