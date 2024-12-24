import { DateRange } from 'components/admin/DatePickers/_shared/typings';

import { SelectionMode } from '../../typings';

interface GetUpdatedRangeParams {
  selectedRange: Partial<DateRange>;
  selectionMode: SelectionMode;
  clickedDate: Date;
}

export const getUpdatedRange = ({
  selectedRange: { from, to },
  selectionMode,
  clickedDate,
}: GetUpdatedRangeParams): Partial<DateRange> => {
  // If a 'from' date has been chosen, and the user
  // clicks any date before that, we ignore the selection
  // mode and just reset the date to a date before.
  if (from && !to && clickedDate < from) {
    return {
      from: clickedDate,
      to: undefined,
    };
  }

  // The same happens if only a 'to' date has been selected
  // and the user clicks any date after that.
  if (to && !from && clickedDate > to) {
    return {
      from: undefined,
      to: clickedDate,
    };
  }

  // In any other case, we just set the date according to the
  // selection mode.
  if (selectionMode === 'from') {
    return {
      from: clickedDate,
      to,
    };
  } else {
    return {
      from,
      to: clickedDate,
    };
  }
};
