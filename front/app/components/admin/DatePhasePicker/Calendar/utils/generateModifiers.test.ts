import { generateModifiers } from './generateModifiers';

describe('generateModifiers', () => {
  describe('no selectedRange or disabledRanges', () => {
    it('is empty if no selectedRange', () => {
      expect(
        generateModifiers({ selectedRange: {}, disabledRanges: [] })
      ).toEqual({});
    });
  });

  describe('only selectedRange', () => {
    const disabledRanges = [];

    it('shows selection if closed range', () => {
      const selectedRange = {
        from: new Date(2024, 2, 1),
        to: new Date(2024, 3, 1),
      };

      expect(generateModifiers({ selectedRange, disabledRanges })).toEqual({
        isSelectedStart: selectedRange.from,
        isSelectedEnd: selectedRange.to,
        isSelectedMiddle: {
          from: new Date(2024, 2, 2),
          to: new Date(2024, 2, 31),
        },
      });
    });

    it('shows selection without middle if closed range of 1 day', () => {
      const selectedRange = {
        from: new Date(2024, 2, 1),
        to: new Date(2024, 2, 2),
      };

      expect(generateModifiers({ selectedRange, disabledRanges })).toEqual({
        isSelectedStart: selectedRange.from,
        isSelectedEnd: selectedRange.to,
      });
    });

    it('shows gradient if open range', () => {
      const selectedRange = {
        from: new Date(2024, 2, 1),
      };

      expect(generateModifiers({ selectedRange, disabledRanges })).toEqual({
        isSelectedStart: selectedRange.from,
        isSelectedGradient_one: new Date(2024, 2, 2),
        isSelectedGradient_two: new Date(2024, 2, 3),
        isSelectedGradient_three: new Date(2024, 2, 4),
      });
    });
  });

  describe('only disabledRanges', () => {
    // TODO
  });

  describe('selectedRange and disabledRanges', () => {
    // TODO
  });
});
