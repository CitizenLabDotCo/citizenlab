export default function shallowCompare(a, b) {
  for (const key in a) {
    if (a[key] !== b[key]) {
      return false;
    }
  }
  for (const key in b) {
    if (b[key] !== a[key]) {
      return false;
    }
  }

  return true;
}
