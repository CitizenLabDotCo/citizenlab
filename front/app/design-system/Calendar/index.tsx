import React from 'react';

import { CalendarDate } from '@internationalized/date';
import { Calendar as AriaCalendar } from 'react-aria-components';

import '../tokens.css';

import styles from './Calendar.module.css';
import CalendarMonth from './CalendarMonth';

// Takes its value and limits from the Date picker it sits in.
const Calendar = () => (
  <AriaCalendar<CalendarDate> className={styles.calendar} firstDayOfWeek="mon">
    <CalendarMonth />
  </AriaCalendar>
);

export { default as DayPressCalendar } from './DayPressCalendar';
export type { OpenRangeValue } from './DayPressCalendar';

export default Calendar;
