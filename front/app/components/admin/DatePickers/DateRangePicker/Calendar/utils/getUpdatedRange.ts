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
  if (selectionMode === 'from') {
    // If you are in the 'from' selection mode,
    // but you click a date after the 'to' date,
    // we will set the 'from' date but
    // remove the 'to' date.
    if (from && to && clickedDate > to) {
      return {
        from: clickedDate,
        to: undefined,
      };
    }

    return {
      from: clickedDate,
      to,
    };
  }

  // If you are the 'to' selection mode,
  // but you click a date before the 'from'
  // date, we will set the 'to' date but
  // remove the 'from' date.
  if (from && to && clickedDate < from) {
    return {
      from: undefined,
      to: clickedDate,
    };
  }

  return {
    from,
    to: clickedDate,
  };
};
