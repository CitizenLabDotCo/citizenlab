import { isValidCoordinate } from './utils';

describe('isValidCoordinate', () => {
  it('should return true for a valid coordinate', () => {
    expect(isValidCoordinate('40.7128, -74.0060')).toBe(true);
    expect(isValidCoordinate('80.7128, - 74.0060')).toBe(true);
    expect(isValidCoordinate('0, 0')).toBe(true);
    expect(isValidCoordinate('+12.345, -67.890')).toBe(true);
  });

  it('should return false for an invalid coordinate', () => {
    expect(isValidCoordinate('invalid')).toBe(false);
    expect(isValidCoordinate('12.34,')).toBe(false);
    expect(isValidCoordinate('12.34, -200')).toBe(false);
    expect(isValidCoordinate('-90.123, 180.456')).toBe(false);
    expect(isValidCoordinate('91, 45')).toBe(false);
  });
});
