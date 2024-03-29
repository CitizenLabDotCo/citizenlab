export default function testEnv(input: any) {
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
    return input;
  }
}
