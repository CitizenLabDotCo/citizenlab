import { PropsBase } from 'react-day-picker';

import { DateRange } from '../_shared/typings';

export interface Props {
  selectedRange: Partial<DateRange>;
  startMonth?: Date;
  endMonth?: Date;
  defaultMonth?: Date;
  disabled?: PropsBase['disabled'];
  numberOfMonths?: 1 | 2;
  onUpdateRange: (range: Partial<DateRange>) => void;
  height?: string;
}

export interface CalendarProps extends Props {
  selectionMode?: SelectionMode;
  onUpdateSelectionMode: (selectionMode: SelectionMode) => void;
}

export type SelectionMode = 'from' | 'to';
