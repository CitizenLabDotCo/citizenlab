export type DateRange = {
  from: Date;
  to?: Date;
};

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
}
