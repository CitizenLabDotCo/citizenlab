import { sum, isNilOrError } from './helperUtils';

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});

describe('isNilOrError', () => {
  test.each([[null, true], [undefined, true], [new Error, true], [42, false], [{}, false]])('gives the right result for %p', (val, expected) => {
    expect(isNilOrError(val)).toBe(expected);
  });
});
