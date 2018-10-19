import { sum, isNilOrError } from './helperUtils';

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});

test('null is nilOrError', () => {
  expect(isNilOrError(null)).toBe(true);
});

test('42 is not nilOrError', () => {
  expect(isNilOrError(42)).toBe(false);
});
