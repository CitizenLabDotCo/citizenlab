import { DateRange } from '../_shared/typings';

export interface Props {
  selectedRange: Partial<DateRange>;
  startMonth?: Date;
  endMonth?: Date;
  defaultMonth?: Date;
  onUpdateRange: (range: Partial<DateRange>) => void;
}
