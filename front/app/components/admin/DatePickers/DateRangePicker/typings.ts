import { PropsBase, TZDate } from 'react-day-picker';

import { DateRange } from '../_shared/typings';

export interface Props {
  selectedRange: Partial<DateRange>;
  startMonth?: TZDate;
  endMonth?: TZDate;
  defaultMonth?: TZDate;
  disabled?: PropsBase['disabled'];
  onUpdateRange: (range: Partial<DateRange>) => void;
}

export interface CalendarProps extends Props {
  selectionMode?: SelectionMode;
  onUpdateSelectionMode: (selectionMode: SelectionMode) => void;
}

export type SelectionMode = 'from' | 'to';
