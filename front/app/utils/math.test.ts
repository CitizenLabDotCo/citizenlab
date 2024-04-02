import { roundPercentage, roundPercentages, sum } from './math';

const e = 10 ** -6;
const closeTo = (value1: number, value2: number) =>
  Math.abs(value1 - value2) < e;

describe('roundPercentage', () => {
  it('works', () => {
    expect(roundPercentage(1, 3)).toBe(33);
  });

  it('works with decimals', () => {
    expect(roundPercentage(1, 3, 1)).toBe(33.3);
  });

  it('works with 0s', () => {
    expect(roundPercentage(0, 3)).toBe(0);
    expect(roundPercentage(0, 0)).toBe(0);
  });
});

describe('roundPercentages', () => {
  describe('no decimals', () => {
    it('works', () => {
      const output = sum(roundPercentages([405, 595]));
      expect(closeTo(output, 100)).toBe(true);
    });

    it('works (1/3s)', () => {
      const output = sum(roundPercentages([100, 100, 100]));
      expect(closeTo(output, 100)).toBe(true);
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

  describe('with decimals', () => {
    it('works', () => {
      const output = sum(roundPercentages([4005, 5995], 1));
      expect(closeTo(output, 100)).toBe(true);
    });

    it('works (1/3s)', () => {
      const output = sum(roundPercentages([100, 100, 100], 1));
      expect(closeTo(output, 100)).toBe(true);
    });

    it('works (stackoverflow example)', () => {
      const input = [13626332, 47989636, 9596008, 28788024];

      const expectedOutput = [13.6, 48.0, 9.6, 28.8];

      expect(roundPercentages(input, 1)).toEqual(expectedOutput);
    });

    it('returns zeroes if all inputs are zero', () => {
      expect(roundPercentages([0, 0, 0], 1)).toEqual([0, 0, 0]);
    });

    it('works for [1, 1]', () => {
      expect(roundPercentages([1, 1], 1)).toEqual([50, 50]);
    });
  });
});
