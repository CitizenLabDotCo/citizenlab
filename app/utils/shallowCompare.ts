export default function shallowCompare(a, b) {
  for (const key in a) {
    if (!(key in b) || a[key] !== b[key]) {
      return false;
    }
  }

  for (const key in b) {
    if (!(key in a) || b[key] !== a[key]) {
      return false;
    }
  }

  return true;
}
