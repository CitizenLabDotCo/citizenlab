import { PropsBase } from 'react-day-picker';

import { DateRange } from '../_shared/typings';

export interface Props {
  selectedRange: Partial<DateRange>;
  startMonth?: Date;
  endMonth?: Date;
  defaultMonth?: Date;
  disabled?: PropsBase['disabled'];
  onUpdateRange: (range: Partial<DateRange>) => void;
}
