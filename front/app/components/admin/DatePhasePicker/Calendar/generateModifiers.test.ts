import { generateModifiers } from './generateModifiers';

// const BASE_MODIFERS = {
//   isDisabled: [],
//   isDisabledStart: [],
//   isDisabledEnd: [],
//   isSelected: [],
//   isSelectedStart: [],
//   isSelectedEnd: []
// }

describe('generateModifiers', () => {
  describe('idle view', () => {
    describe('without disabled ranges', () => {
      it('if four-day selection, isSelected should not be empty', () => {
        const previouslySelectedRange = {
          from: new Date(2024, 9, 10),
          to: new Date(2024, 9, 13),
        };

        const disabledRanges = [];

        const expectedModifiers = {
          isSelected: {
            from: new Date(2024, 9, 11),
            to: new Date(2024, 9, 12),
          },
          isSelectedStart: previouslySelectedRange.from,
          isSelectedEnd: previouslySelectedRange.to,
        };

        expect(
          generateModifiers({ previouslySelectedRange, disabledRanges })
        ).toEqual(expectedModifiers);
      });

      it('if two-day selection, isSelected should be empty', () => {
        const previouslySelectedRange = {
          from: new Date(2024, 9, 10),
          to: new Date(2024, 9, 11),
        };

        const disabledRanges = [];

        const expectedModifiers = {
          isSelectedStart: previouslySelectedRange.from,
          isSelectedEnd: previouslySelectedRange.to,
        };

        expect(
          generateModifiers({ previouslySelectedRange, disabledRanges })
        ).toEqual(expectedModifiers);
      });
    });

    describe('with disabled ranges (all closed)', () => {
      const DISABLED_RANGES = [
        { from: new Date(2024, 8, 1), to: new Date(2024, 9, 5) },
        { from: new Date(2024, 9, 21), to: new Date(2024, 10, 28) },
      ];

      it('works', () => {
        const selectedRange = {
          from: new Date(2024, 9, 10),
          to: new Date(2024, 9, 20),
        };

        const expectedResult = {
          isDisabled: [
            {
              from: new Date(2024, 8, 2),
              to: new Date(2024, 9, 4),
            },
            {
              from: new Date(2024, 9, 22),
              to: new Date(2024, 10, 27),
            },
          ],
          isDisabledStart: [new Date(2024, 8, 1), new Date(2024, 9, 21)],
          isDisabledEnd: [new Date(2024, 9, 5), new Date(2024, 10, 28)],
          isSelected: {
            from: new Date(2024, 9, 11),
            to: new Date(2024, 9, 19),
          },
          isSelectedStart: new Date(2024, 9, 10),
          isSelectedEnd: new Date(2024, 9, 20),
        };

        expect(
          generateModifiers({
            previouslySelectedRange: selectedRange,
            disabledRanges: DISABLED_RANGES,
          })
        ).toEqual(expectedResult);
      });
    });

    // describe('with disabled ranges (last open)', () => {
    // TODO
    // })
  });

  // describe('selecting view', () => {

  // });
});
