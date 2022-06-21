import { roundPercentages, sum } from './math';

describe('roundPercentages', () => {
  it('works', () => {
    expect(sum(roundPercentages([405, 595]))).toBe(100);
  });

  it('works (1/3s)', () => {
    expect(sum(roundPercentages([100, 100, 100]))).toBe(100);
  });

  it('works (stackoverflow example)', () => {
    const input = [13626332, 47989636, 9596008, 28788024];

    const expectedOutput = [14, 48, 9, 29];

    expect(roundPercentages(input)).toEqual(expectedOutput);
  });

  it('returns zeroes if all inputs are zero', () => {
    expect(roundPercentages([0, 0, 0])).toEqual([0, 0, 0]);
  });
});
