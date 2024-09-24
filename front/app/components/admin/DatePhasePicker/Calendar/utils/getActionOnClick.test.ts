import { getActionOnClick } from './getActionOnClick';

describe('getActionOnClick', () => {
  it('sets the currently selected date if there is no currently selected date', () => {
    const disabledRanges = [];
    const currentlySelectedDate = undefined;
    const lastClickedDate = new Date();

    const action = getActionOnClick({
      disabledRanges,
      currentlySelectedDate,
      lastClickedDate,
    });

    expect(action).toEqual({
      action: 'select-date',
      date: lastClickedDate,
    });
  });

  it('sets the currently selected date if the last clicked date is before the currently selected date', () => {
    const disabledRanges = [];
    const currentlySelectedDate = new Date(2024, 8, 1);
    const lastClickedDate = new Date(2024, 7, 1);

    const action = getActionOnClick({
      disabledRanges,
      currentlySelectedDate,
      lastClickedDate,
    });

    expect(action).toEqual({
      action: 'select-date',
      date: lastClickedDate,
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
      currentlySelectedDate,
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
      currentlySelectedDate,
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
      currentlySelectedDate,
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
