import { getNextSelectedRange } from './utils';

describe('getNextSelectedRange', () => {
  describe('without disabled ranges', () => {
    const disabledRanges = [];
    const selectedRange = {
      from: new Date('2021-02-01'),
      to: new Date('2021-02-01'),
    };

    it('creates multi-day range when clicking after a one-day range', () => {
      const day = new Date('2021-02-10');
      const result = getNextSelectedRange(day, selectedRange, disabledRanges);
      expect(result).toEqual({ from: selectedRange.from, to: day });
    });

    it('moves one-day range when clicking before it', () => {
      const day = new Date('2021-01-01');
      const result = getNextSelectedRange(day, selectedRange, disabledRanges);
      expect(result).toEqual({ from: day, to: day });
    });
  });

  describe('with disabled ranges', () => {
    it('creates single-day range when clicking after a disabled range', () => {
      const disabledRanges = [
        { from: new Date('2021-01-01'), to: new Date('2021-01-25') },
        { from: new Date('2021-02-05'), to: new Date('2021-02-10') },
      ];

      const selectedRange = {
        from: new Date('2021-02-01'),
        to: new Date('2021-02-01'),
      };

      const day = new Date('2021-02-20');
      const result = getNextSelectedRange(day, selectedRange, disabledRanges);
      expect(result).toEqual({ from: day, to: day });
    });
  });
});
