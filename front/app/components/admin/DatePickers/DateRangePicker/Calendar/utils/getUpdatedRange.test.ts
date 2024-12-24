import { getUpdatedRange } from './getUpdatedRange';

describe('getUpdatedRange', () => {
  describe('selectionMode = from', () => {
    const selectionMode = 'from';

    it('if no dates set, should set from date', () => {
      const selectedRange = { from: undefined, to: undefined };
      const clickedDate = new Date(2021, 1, 1);
      const result = getUpdatedRange({
        selectedRange,
        selectionMode,
        clickedDate,
      });
      expect(result).toEqual({ from: clickedDate, to: undefined });
    });

    it('if only from date set, should overwrite from date', () => {
      const selectedRange = { from: new Date(2022, 1, 1), to: undefined };
      const clickedDate = new Date(2021, 1, 1);
      const result = getUpdatedRange({
        selectedRange,
        selectionMode,
        clickedDate,
      });
      expect(result).toEqual({ from: clickedDate, to: undefined });
    });

    describe('if only to date set', () => {
      const to = new Date(2022, 1, 1);

      it('if clicked date is before to date, should set from date', () => {
        const selectedRange = { from: undefined, to };
        const clickedDate = new Date(2021, 1, 1);
        const result = getUpdatedRange({
          selectedRange,
          selectionMode,
          clickedDate,
        });
        expect(result).toEqual({ from: clickedDate, to });
      });

      it('if clicked date is after to date, should set from date and remove to date', () => {
        const selectedRange = { from: undefined, to };
        const clickedDate = new Date(2023, 1, 1);
        const result = getUpdatedRange({
          selectedRange,
          selectionMode,
          clickedDate,
        });
        expect(result).toEqual({ from: clickedDate, to: undefined });
      });

      it('if clicked date is equal to to date, should set from date and remove to date', () => {
        const selectedRange = { from: undefined, to };
        const clickedDate = new Date(2022, 1, 1);
        const result = getUpdatedRange({
          selectedRange,
          selectionMode,
          clickedDate,
        });
        expect(result).toEqual({ from: clickedDate, to: undefined });
      });
    });

    describe('if both dates set', () => {
      const from = new Date(2021, 1, 1);
      const to = new Date(2022, 1, 1);
      const selectedRange = { from, to };

      it('if clicked date is before to date, should set from date', () => {
        const clickedDate = new Date(2020, 1, 1);
        const result = getUpdatedRange({
          selectedRange,
          selectionMode,
          clickedDate,
        });
        expect(result).toEqual({ from: clickedDate, to });
      });

      it('if clicked date is after to date, should set from date and remove to date', () => {
        const clickedDate = new Date(2023, 1, 1);
        const result = getUpdatedRange({
          selectedRange,
          selectionMode,
          clickedDate,
        });
        expect(result).toEqual({ from: clickedDate, to: undefined });
      });

      it('if clicked date is equal to to date, should set from date and remove to date', () => {
        const clickedDate = new Date(2022, 1, 1);
        const result = getUpdatedRange({
          selectedRange,
          selectionMode,
          clickedDate,
        });
        expect(result).toEqual({ from: clickedDate, to: undefined });
      });
    });
  });

  describe('selectionMode = to', () => {
    const selectionMode = 'from';

    it('if no dates set, should set to date', () => {
      const selectedRange = { from: undefined, to: undefined };
      const clickedDate = new Date(2021, 1, 1);
      const result = getUpdatedRange({
        selectedRange,
        selectionMode,
        clickedDate,
      });
      expect(result).toEqual({ from: undefined, to: clickedDate });
    });
  });
});
