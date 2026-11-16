import React from 'react';

import { CalendarDate } from '@internationalized/date';
import {
  RangeCalendar as AriaRangeCalendar,
  DateValue,
  RangeValue,
} from 'react-aria-components';

import '../tokens.css';

import styles from './Calendar.module.css';
import CalendarMonth from './CalendarMonth';
import DayPressCalendar from './DayPressCalendar';

// A range that may have no end yet, or no end at all.
export type OpenRangeValue<T> = {
  start: T;
  end: T | null;
};

type SharedProps = {
  minValue?: DateValue;
  maxValue?: DateValue;
  isDateUnavailable?: (date: DateValue) => boolean;
  isDisabled?: boolean;
  autoFocus?: boolean;
  // The day that has focus first, and so the month shown first.
  defaultFocusedValue?: DateValue;
  'aria-label'?: string;
};

type RangeSelectionProps = SharedProps & {
  value?: RangeValue<CalendarDate> | null;
  defaultValue?: RangeValue<CalendarDate> | null;
  onChange?: (value: RangeValue<CalendarDate>) => void;
  onDayPress?: undefined;
};

// For ranges with their own rules: every press goes to onDayPress, and the
// caller decides the new value.
type DayPressProps = SharedProps & {
  value: OpenRangeValue<CalendarDate> | null;
  onDayPress: (date: CalendarDate) => void;
  defaultValue?: undefined;
  onChange?: undefined;
};

export type RangeCalendarProps = RangeSelectionProps | DayPressProps;

const RangeCalendar = (props: RangeCalendarProps) => {
  if (props.onDayPress !== undefined) {
    return (
      <DayPressCalendar
        value={props.value}
        onDayPress={props.onDayPress}
        minValue={props.minValue}
        maxValue={props.maxValue}
        isDateUnavailable={props.isDateUnavailable}
        isDisabled={props.isDisabled}
        autoFocus={props.autoFocus}
        defaultFocusedValue={props.defaultFocusedValue}
        aria-label={props['aria-label']}
      />
    );
  }

  return (
    <AriaRangeCalendar<CalendarDate>
      className={styles.calendar}
      value={props.value}
      defaultValue={props.defaultValue}
      onChange={props.onChange}
      minValue={props.minValue}
      maxValue={props.maxValue}
      isDateUnavailable={props.isDateUnavailable}
      isDisabled={props.isDisabled}
      autoFocus={props.autoFocus}
      defaultFocusedValue={props.defaultFocusedValue}
      firstDayOfWeek="mon"
      aria-label={props['aria-label']}
    >
      <CalendarMonth isRange />
    </AriaRangeCalendar>
  );
};

export default RangeCalendar;
