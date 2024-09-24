import { getActionOnClick } from './getActionOnClick';

describe('getActionOnClick', () => {
  describe('no disabled ranges', () => {
    it('if no currently selected date: it sets the range to open ended when you click anywhere', () => {
      const disabledRanges = [];
      const internallySelectedDate = undefined;
      const lastClickedDate = new Date();

      const action = getActionOnClick({
        disabledRanges,
        internallySelectedDate,
        lastClickedDate,
      });

      expect(action).toEqual({
        action: 'select-range',
        range: {
          from: lastClickedDate,
          to: undefined,
        },
      });
    });

    it('if currenty selected date and you click before it: it sets the range open ended starting on the new date', () => {
      const disabledRanges = [];
      const currentlySelectedDate = new Date(2024, 8, 1);
      const lastClickedDate = new Date(2024, 7, 1);

      const action = getActionOnClick({
        disabledRanges,
        internallySelectedDate,
        lastClickedDate,
      });

      expect(action).toEqual({
        action: 'select-range',
        date: {
          from: lastClickedDate,
          to: undefined,
        },
      });
    });

    it('if currenty selected date and you click after it: it closes the range', () => {
      const disabledRanges = [];

      const currentlySelectedDate = new Date(2024, 8, 1);
      const lastClickedDate = new Date(2024, 9, 1);

      const action = getActionOnClick({
        disabledRanges,
        internallySelectedDate,
        lastClickedDate,
      });
    });
  });

  it('sets the currently selected date if the potential range overlaps with a closed disabled range', () => {
    const disabledRanges = [
      { from: new Date(2024, 2, 1), to: new Date(2024, 2, 5) },
    ];
    const currentlySelectedDate = new Date(2024, 1, 25);
    const lastClickedDate = new Date(2024, 2, 10);

    const action = getActionOnClick({
      disabledRanges,
      internallySelectedDate,
      lastClickedDate,
    });

    expect(action).toEqual({
      action: 'select-date',
      date: lastClickedDate,
    });
  });

  it('sets the currently selected date if the potential range overlaps with an open disabled range', () => {
    const disabledRanges = [{ from: new Date(2024, 2, 1) }];
    const currentlySelectedDate = new Date(2024, 1, 25);
    const lastClickedDate = new Date(2024, 2, 10);

    const action = getActionOnClick({
      disabledRanges,
      internallySelectedDate,
      lastClickedDate,
    });

    expect(action).toEqual({
      action: 'select-date',
      date: lastClickedDate,
    });
  });

  it('sets the range if the range does not overlap with any disabled range', () => {
    const disabledRanges = [
      { from: new Date(2024, 2, 1), to: new Date(2024, 2, 5) },
    ];
    const currentlySelectedDate = new Date(2024, 2, 25);
    const lastClickedDate = new Date(2024, 3, 10);

    const action = getActionOnClick({
      disabledRanges,
      internallySelectedDate,
      lastClickedDate,
    });

    expect(action).toEqual({
      action: 'select-range',
      range: {
        from: currentlySelectedDate,
        to: lastClickedDate,
      },
    });
  });
});
