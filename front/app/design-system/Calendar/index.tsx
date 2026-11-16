import React from 'react';

import { CalendarDate } from '@internationalized/date';
import { Calendar as AriaCalendar, DateValue } from 'react-aria-components';

import '../tokens.css';

import styles from './Calendar.module.css';
import CalendarMonth from './CalendarMonth';

export type CalendarProps = {
  value?: CalendarDate | null;
  defaultValue?: CalendarDate | null;
  onChange?: (value: CalendarDate) => void;
  minValue?: DateValue;
  maxValue?: DateValue;
  isDateUnavailable?: (date: DateValue) => boolean;
  isDisabled?: boolean;
  autoFocus?: boolean;
  'aria-label'?: string;
};

const Calendar = ({
  value,
  defaultValue,
  onChange,
  minValue,
  maxValue,
  isDateUnavailable,
  isDisabled,
  autoFocus,
  'aria-label': ariaLabel,
}: CalendarProps) => (
  <AriaCalendar<CalendarDate>
    className={styles.calendar}
    value={value}
    defaultValue={defaultValue}
    onChange={onChange}
    minValue={minValue}
    maxValue={maxValue}
    isDateUnavailable={isDateUnavailable}
    isDisabled={isDisabled}
    autoFocus={autoFocus}
    firstDayOfWeek="mon"
    aria-label={ariaLabel}
  >
    <CalendarMonth />
  </AriaCalendar>
);

export { default as RangeCalendar } from './RangeCalendar';
export type { OpenRangeValue, RangeCalendarProps } from './RangeCalendar';

export default Calendar;
