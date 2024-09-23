import { DateRange } from './typings';

interface GetNextSelectedRangeParams {
  disabledRanges: DateRange[];
  currentlySelectedDate: Date;
  lastClickedDate: Date;
}

export const getNextSelectedRange = ({
  // disabledRanges,
  currentlySelectedDate,
  lastClickedDate,
}: GetNextSelectedRangeParams) => {
  // We assume lastClickedDate > currentlySelectedDate here
  const newRange = { from: currentlySelectedDate, to: lastClickedDate };

  // TODO make sure no overlap with disabled ranges

  // TODO make sure correct wrt open ended disabled range

  return newRange;
};
