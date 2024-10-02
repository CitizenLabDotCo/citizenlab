export interface CalendarProps {
  startMonth?: Date;
  endMonth?: Date;
  selectedDate?: Date;
  onChange: (date: Date) => void;
}

export interface Props extends CalendarProps {
  id?: string;
  disabled?: boolean;
}
