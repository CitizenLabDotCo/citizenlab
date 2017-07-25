export default function shallowCompare(a, b) {
  for (const key in a) {
    if (a[key] !== b[key]) {
      return false;
    }
  }

  return true;
}
