import React from 'react';

import { CalendarDate } from '@internationalized/date';
import {
  Button,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  Heading,
} from 'react-aria-components';

import Icon from '../Icon';
import '../tokens.css';

import styles from './Calendar.module.css';
import ghostStyles from './GhostButton.module.css';

import type { OpenRangeValue } from './DayPressCalendar';

// The weekday headers are hidden from assistive tech (each day is labelled),
// so trimming the short name to two letters (Mo, Tu) is visual only.
const twoLetters = (day: string) => Array.from(day).slice(0, 2).join('');

// Where a day sits in a range the caller owns (DayPressCalendar).
const rangeClass = (
  date: CalendarDate,
  range: OpenRangeValue<CalendarDate> | null
) => {
  if (!range?.end || range.end.compare(range.start) === 0) return '';
  if (date.compare(range.start) === 0) return styles.rangeStart;
  if (date.compare(range.end) === 0) return styles.rangeEnd;
  if (date.compare(range.start) > 0 && date.compare(range.end) < 0) {
    return styles.rangeMiddle;
  }
  return '';
};

type Props = {
  range?: OpenRangeValue<CalendarDate> | null;
};

// The header and grid inside a Calendar or DayPressCalendar.
const CalendarMonth = ({ range = null }: Props) => (
  <>
    <header className={styles.header}>
      <Button slot="previous" className={ghostStyles.button}>
        <Icon name="chevron-left-16" />
      </Button>
      <Heading className={styles.month} />
      <Button slot="next" className={ghostStyles.button}>
        <Icon name="chevron-right-16" />
      </Button>
    </header>
    <CalendarGrid className={styles.grid} weekdayStyle="short">
      <CalendarGridHeader>
        {(day) => (
          <CalendarHeaderCell className={styles.weekday}>
            {twoLetters(day)}
          </CalendarHeaderCell>
        )}
      </CalendarGridHeader>
      <CalendarGridBody>
        {(date) => (
          <CalendarCell
            date={date}
            className={`${styles.cell} ${rangeClass(date, range)}`}
          />
        )}
      </CalendarGridBody>
    </CalendarGrid>
  </>
);

export default CalendarMonth;
