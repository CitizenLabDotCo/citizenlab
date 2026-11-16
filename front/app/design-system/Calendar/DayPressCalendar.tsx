import React from 'react';

import { CalendarDate, isSameDay } from '@internationalized/date';
import { Calendar as AriaCalendar, DateValue } from 'react-aria-components';

import '../tokens.css';

import styles from './Calendar.module.css';
import CalendarMonth from './CalendarMonth';

import type { OpenRangeValue } from './RangeCalendar';

const daysFrom = (start: CalendarDate, end: CalendarDate) => {
  const days: CalendarDate[] = [];
  for (let day = start; day.compare(end) <= 0; day = day.add({ days: 1 })) {
    days.push(day);
  }
  return days;
};

type Props = {
  value: OpenRangeValue<CalendarDate> | null;
  onDayPress: (date: CalendarDate) => void;
  minValue?: DateValue;
  maxValue?: DateValue;
  isDateUnavailable?: (date: DateValue) => boolean;
  isDisabled?: boolean;
  autoFocus?: boolean;
  defaultFocusedValue?: DateValue;
  'aria-label'?: string;
};

/*
 * React Aria's RangeCalendar applies its own two-press selection and cannot
 * hold a range without an end. A multiple-selection Calendar holding every
 * day of the range keeps each day announced as selected, and the one day a
 * press adds or removes is the pressed day.
 */
const DayPressCalendar = ({
  value,
  onDayPress,
  minValue,
  maxValue,
  isDateUnavailable,
  isDisabled,
  autoFocus,
  defaultFocusedValue,
  'aria-label': ariaLabel,
}: Props) => {
  const selectedDays = !value
    ? []
    : value.end
    ? daysFrom(value.start, value.end)
    : [value.start];

  const handleChange = (days: readonly CalendarDate[]) => {
    const pressed =
      days.find((day) => !selectedDays.some((s) => isSameDay(s, day))) ??
      selectedDays.find((s) => !days.some((day) => isSameDay(day, s)));

    if (pressed) onDayPress(pressed);
  };

  return (
    <AriaCalendar<CalendarDate, 'multiple'>
      selectionMode="multiple"
      className={styles.calendar}
      value={selectedDays}
      onChange={handleChange}
      minValue={minValue}
      maxValue={maxValue}
      isDateUnavailable={isDateUnavailable}
      isDisabled={isDisabled}
      autoFocus={autoFocus}
      defaultFocusedValue={defaultFocusedValue}
      firstDayOfWeek="mon"
      aria-label={ariaLabel}
    >
      <CalendarMonth range={value} />
    </AriaCalendar>
  );
};

export default DayPressCalendar;
