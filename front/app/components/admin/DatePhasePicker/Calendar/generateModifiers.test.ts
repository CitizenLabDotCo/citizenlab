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

    describe('with disabled ranges', () => {
      // TODO
    });
  });

  // describe('selecting view', () => {

  // });
});
