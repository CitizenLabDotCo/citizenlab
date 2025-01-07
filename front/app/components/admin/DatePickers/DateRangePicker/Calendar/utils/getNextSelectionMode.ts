import { DateRange } from 'components/admin/DatePickers/_shared/typings';

import { SelectionMode } from '../../typings';

interface GetNextSelectionModeParams {
  selectedRange: Partial<DateRange>;
  selectionMode: SelectionMode;
}

export const getNextSelectionMode = ({
  selectedRange,
  selectionMode,
}: GetNextSelectionModeParams) => {
  if (selectedRange.from && !selectedRange.to) {
    return 'to';
  }

  if (!selectedRange.from && selectedRange.to) {
    return 'from';
  }

  return selectionMode;
};
