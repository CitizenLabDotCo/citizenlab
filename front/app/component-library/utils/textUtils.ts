export function truncate(str: string, length?: number) {
  if (typeof length === 'number' && str.length > length) {
    return `${str.substring(0, length - 3)}...`;
  }
  return str;
}
