import { DateRange } from '../_shared/typings';

export type ClosedDateRange = {
  from: Date;
  to: Date;
};

export interface Props {
  selectedRange: Partial<DateRange>;
  disabledRanges?: DateRange[];
  startMonth?: Date;
  endMonth?: Date;
  defaultMonth?: Date;
  onUpdateRange: (range: Partial<DateRange>) => void;
  className?: string;
}
