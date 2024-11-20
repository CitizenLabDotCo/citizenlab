import { getUpdatedRange } from './getUpdatedRange';

describe('getUpdatedRange', () => {
  describe('selectedRange is empty', () => {
    it('sets start date on click', () => {
      const selectedRange = {};
      const disabledRanges = [];
      const clickedDate = new Date(2024, 2, 1);

      expect(
        getUpdatedRange({ selectedRange, disabledRanges, clickedDate })
      ).toEqual({
        from: clickedDate,
      });
    });

    it('is possible to click one day after open-ended disabled range', () => {
      const selectedRange = {};
      const disabledRanges = [{ from: new Date(2024, 3, 1) }];
      const clickedDate = new Date(2024, 3, 2);

      expect(
        getUpdatedRange({ selectedRange, disabledRanges, clickedDate })
      ).toEqual({
        from: clickedDate,
      });
    });
  });

  describe('selectedRange has a start date', () => {
    it('updates start date if clicked date is before start date', () => {
      const selectedRange = { from: new Date(2024, 3, 1) };
      const disabledRanges = [];
      const clickedDate = new Date(2024, 2, 1);

      expect(
        getUpdatedRange({ selectedRange, disabledRanges, clickedDate })
      ).toEqual({
        from: clickedDate,
      });
    });

    it('creates single-day phase if clicked date is start date', () => {
      const date = new Date(2024, 3, 1);
      const selectedRange = { from: date };
      const disabledRanges = [];

      expect(
        getUpdatedRange({ selectedRange, disabledRanges, clickedDate: date })
      ).toEqual({
        from: date,
        to: date,
      });
    });

    it('updates start date if clicked date is after start date and overlaps with disabled range', () => {
      const selectedRange = { from: new Date(2024, 3, 1) };
      const disabledRanges = [
        { from: new Date(2024, 4, 1), to: new Date(2024, 4, 4) },
      ];
      const clickedDate = new Date(2024, 5, 1);

      expect(
        getUpdatedRange({ selectedRange, disabledRanges, clickedDate })
      ).toEqual({
        from: clickedDate,
      });
    });

    it('updates end date if clicked date is after start date and does not overlap with disabled range', () => {
      const selectedRange = { from: new Date(2024, 3, 1) };
      const disabledRanges = [
        { from: new Date(2024, 4, 1), to: new Date(2024, 4, 4) },
      ];
      const clickedDate = new Date(2024, 3, 10);

      expect(
        getUpdatedRange({ selectedRange, disabledRanges, clickedDate })
      ).toEqual({
        from: selectedRange.from,
        to: clickedDate,
      });
    });
  });

  describe('selectedRange has a start and end date', () => {
    it('replaces range by just start date', () => {
      const selectedRange = {
        from: new Date(2024, 3, 1),
        to: new Date(2024, 3, 10),
      };
      const disabledRanges = [];
      const clickedDate = new Date(2024, 2, 1);

      expect(
        getUpdatedRange({ selectedRange, disabledRanges, clickedDate })
      ).toEqual({
        from: clickedDate,
      });
    });
  });
});
