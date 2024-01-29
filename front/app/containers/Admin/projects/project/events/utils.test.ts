import { roundToNearestMultipleOfFive, calculateRoundedEndDate } from './utils';

describe('roundToNearestMultipleOfFive', () => {
  test('rounds minutes to the nearest multiple of 5', () => {
    const inputDate = new Date(2024, 0, 1, 12, 17); // January 1, 2024, 12:17 PM
    const result = roundToNearestMultipleOfFive(inputDate);
    const expected = new Date(2024, 0, 1, 12, 20); // Rounded up to the nearest multiple of 5
    expect(result).toEqual(expected);
  });
});

describe('calculateRoundedEndDate', () => {
  test('calculates the rounded end date with default 30 minutes', () => {
    const startDate = new Date(2024, 0, 1, 12, 0); // January 1, 2024, 12:00 PM
    const result = calculateRoundedEndDate(startDate);
    const expected = new Date(2024, 0, 1, 12, 30); // Start date + 30 minutes
    expect(result).toEqual(expected);
  });

  test('calculates the rounded end date with custom minutes', () => {
    const startDate = new Date(2024, 0, 1, 12, 0); // January 1, 2024, 12:00 PM
    const result = calculateRoundedEndDate(startDate, 45); // Custom 45 minutes
    const expected = new Date(2024, 0, 1, 12, 45); // Start date + 45 minutes
    expect(result).toEqual(expected);
  });
});
