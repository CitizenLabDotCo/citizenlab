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
    const selectedRange = {};

    it('correctly handles disabled ranges when all are closed', () => {
      const disabledRanges = [
        {
          from: new Date(2024, 2, 1),
          to: new Date(2024, 3, 1),
        },
        {
          from: new Date(2024, 4, 1),
          to: new Date(2024, 5, 1),
        },
      ];

      expect(generateModifiers({ selectedRange, disabledRanges })).toEqual({
        isDisabledStart: [new Date(2024, 2, 1), new Date(2024, 4, 1)],
        isDisabledEnd: [new Date(2024, 3, 1), new Date(2024, 5, 1)],
        isDisabledMiddle: [
          { from: new Date(2024, 2, 2), to: new Date(2024, 2, 31) },
          { from: new Date(2024, 4, 2), to: new Date(2024, 4, 31) },
        ],
      });
    });

    it('correctly handles disabled ranges when the last is open', () => {
      const disabledRanges = [
        {
          from: new Date(2024, 2, 1),
          to: new Date(2024, 3, 1),
        },
        {
          from: new Date(2024, 4, 1),
        },
      ];

      expect(generateModifiers({ selectedRange, disabledRanges })).toEqual({
        isDisabledStart: [new Date(2024, 2, 1), new Date(2024, 4, 1)],
        isDisabledEnd: [new Date(2024, 3, 1)],
        isDisabledMiddle: [
          { from: new Date(2024, 2, 2), to: new Date(2024, 2, 31) },
        ],
        isDisabledGradient_one: new Date(2024, 4, 2),
        isDisabledGradient_two: new Date(2024, 4, 3),
        isDisabledGradient_three: new Date(2024, 4, 4),
      });
    });

    it('correctly handles single-day disabled ranges when all are closed', () => {
      const disabledRanges = [
        {
          from: new Date(2024, 2, 1),
          to: new Date(2024, 2, 1),
        },
        {
          from: new Date(2024, 2, 2),
          to: new Date(2024, 2, 20),
        },
      ];

      expect(generateModifiers({ selectedRange, disabledRanges })).toEqual({
        isDisabledSingle: [new Date(2024, 2, 1)],
        isDisabledStart: [new Date(2024, 2, 2)],
        isDisabledMiddle: [
          {
            from: new Date(2024, 2, 3),
            to: new Date(2024, 2, 19),
          },
        ],
        isDisabledEnd: [new Date(2024, 2, 20)],
      });
    });

    it('correctly handles single-day disabled ranges when last is open', () => {
      const disabledRanges = [
        {
          from: new Date(2024, 2, 1),
          to: new Date(2024, 2, 1),
        },
        {
          from: new Date(2024, 2, 2),
        },
      ];

      expect(generateModifiers({ selectedRange, disabledRanges })).toEqual({
        isDisabledSingle: [new Date(2024, 2, 1)],
        isDisabledStart: [new Date(2024, 2, 2)],
        isDisabledGradient_one: new Date(2024, 2, 3),
        isDisabledGradient_two: new Date(2024, 2, 4),
        isDisabledGradient_three: new Date(2024, 2, 5),
      });
    });

    it('correctly handles one single-day disabled range', () => {
      const disabledRanges = [
        {
          from: new Date(2024, 2, 1),
          to: new Date(2024, 2, 1),
        },
      ];

      expect(generateModifiers({ selectedRange, disabledRanges })).toEqual({
        isDisabledSingle: [new Date(2024, 2, 1)],
      });
    });
  });

  describe('selectedRange and disabledRanges', () => {
    it('shows selection gradient if selectedRange is open and last', () => {
      const disabledRanges = [
        {
          from: new Date(2024, 2, 1),
          to: new Date(2024, 3, 1),
        },
      ];

      const selectedRange = {
        from: new Date(2024, 4, 1),
      };

      expect(generateModifiers({ selectedRange, disabledRanges })).toEqual({
        isDisabledStart: [new Date(2024, 2, 1)],
        isDisabledEnd: [new Date(2024, 3, 1)],
        isDisabledMiddle: [
          { from: new Date(2024, 2, 2), to: new Date(2024, 2, 31) },
        ],
        isSelectedStart: selectedRange.from,
        isSelectedGradient_one: new Date(2024, 4, 2),
        isSelectedGradient_two: new Date(2024, 4, 3),
        isSelectedGradient_three: new Date(2024, 4, 4),
      });
    });

    it('shows single selected day if selectedRange is open and not last', () => {
      const disabledRanges = [
        {
          from: new Date(2024, 2, 1),
          to: new Date(2024, 3, 1),
        },
        {
          from: new Date(2024, 5, 1),
          to: new Date(2024, 6, 1),
        },
      ];

      const selectedRange = {
        from: new Date(2024, 4, 1),
      };

      expect(generateModifiers({ selectedRange, disabledRanges })).toEqual({
        isDisabledStart: [new Date(2024, 2, 1), new Date(2024, 5, 1)],
        isDisabledMiddle: [
          { from: new Date(2024, 2, 2), to: new Date(2024, 2, 31) },
          { from: new Date(2024, 5, 2), to: new Date(2024, 5, 30) },
        ],
        isDisabledEnd: [new Date(2024, 3, 1), new Date(2024, 6, 1)],
        isSelectedSingleDay: selectedRange.from,
      });
    });
  });
});
