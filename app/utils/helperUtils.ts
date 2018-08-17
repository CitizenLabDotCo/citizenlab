export function isNilOrError(obj: any): obj is undefined | null | Error {
  return (obj === undefined || obj === null || obj instanceof Error);
}

export function returnFileSize(number) {
  if (number < 1024) {
    return number + 'bytes';
  } else if (number >= 1024 && number < 1048576) {
    return (number / 1024).toFixed(1) + 'KB';
  } else if (number >= 1048576) {
    return (number / 1048576).toFixed(1) + 'MB';
  }
  return;
}
