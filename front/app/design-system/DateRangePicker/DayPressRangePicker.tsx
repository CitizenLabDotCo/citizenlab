import React, { ReactNode, useId, useMemo } from 'react';

import {
  CalendarDate,
  CalendarDateTime,
  DateFormatter,
  getLocalTimeZone,
  toCalendarDate,
} from '@internationalized/date';
import {
  Button,
  DateValue,
  Dialog,
  DialogTrigger,
  Popover,
  useLocale,
} from 'react-aria-components';

import { DayPressCalendar, OpenRangeValue } from '../Calendar';
import pickerStyles from '../DatePicker/DatePicker.module.css';
import Divider from '../Divider';
import Icon from '../Icon';

import styles from './DateRangePicker.module.css';
import TimeOfDayField, { TimeOfDay } from './TimeOfDayField';
import '../tokens.css';

type Props = {
  // There is no visible label (a card title names it), so this names it.
  'aria-label': string;
  // An end of null shows endPlaceholder.
  value: OpenRangeValue<CalendarDateTime> | null;
  onDayPress: (date: CalendarDate) => void;
  startPlaceholder: string;
  endPlaceholder: string;
  minValue?: DateValue;
  maxValue?: DateValue;
  isDateUnavailable?: (date: DateValue) => boolean;
  defaultFocusedValue?: DateValue;
  startTime?: TimeOfDay;
  endTime?: TimeOfDay;
  // Shown under the calendar, e.g. in place of the times.
  calendarNote?: ReactNode;
  onOpenChange?: (isOpen: boolean) => void;
};

const isMidnight = (date: CalendarDateTime) =>
  date.hour === 0 && date.minute === 0;

// The days the calendar draws. Midnight to the next midnight is one whole day.
const toCalendarRange = (
  value: OpenRangeValue<CalendarDateTime> | null
): OpenRangeValue<CalendarDate> | null => {
  if (!value) return null;

  const start = toCalendarDate(value.start);
  if (!value.end) return { start, end: null };

  const end = toCalendarDate(value.end);
  const isWholeDay =
    isMidnight(value.start) &&
    isMidnight(value.end) &&
    end.compare(start) === 1;

  return { start, end: isWholeDay ? start : end };
};

// A Date range picker whose calendar hands each day press to the caller, with
// optional times of day. The box is a button: typed dates would skip the
// caller's rules.
const DayPressRangePicker = ({
  'aria-label': ariaLabel,
  value,
  onDayPress,
  startPlaceholder,
  endPlaceholder,
  minValue,
  maxValue,
  isDateUnavailable,
  defaultFocusedValue,
  startTime,
  endTime,
  calendarNote,
  onOpenChange,
}: Props) => {
  const valueId = useId();
  const { locale } = useLocale();
  const [dateFormatter, timeFormatter] = useMemo(
    () => [
      new DateFormatter(locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }),
      new DateFormatter(locale, { hour: 'numeric', minute: '2-digit' }),
    ],
    [locale]
  );
  const format = (date: CalendarDateTime) => {
    const value = date.toDate(getLocalTimeZone());
    return `${dateFormatter.format(value)} ${timeFormatter.format(value)}`;
  };

  const hasFooter = !!startTime || !!endTime || !!calendarNote;

  return (
    <div className={styles.picker}>
      <DialogTrigger onOpenChange={onOpenChange}>
        <Button
          className={`${pickerStyles.box} ${pickerStyles.size36} ${styles.trigger}`}
          aria-label={ariaLabel}
          aria-describedby={valueId}
        >
          <span className={styles.values} id={valueId}>
            <span className={value ? styles.value : styles.placeholder}>
              {value ? format(value.start) : startPlaceholder}
            </span>
            <span className={styles.arrow} aria-hidden>
              {' → '}
            </span>
            <span className={value?.end ? styles.value : styles.placeholder}>
              {value?.end ? format(value.end) : endPlaceholder}
            </span>
          </span>
          <span className={styles.calendarIcon} aria-hidden>
            <Icon name="calendar-16" />
          </span>
        </Button>
        <Popover
          className={pickerStyles.popover}
          placement="bottom start"
          offset={4}
        >
          <Dialog
            className={`${pickerStyles.dialog} ${styles.dialog}`}
            aria-label={ariaLabel}
          >
            <DayPressCalendar
              value={toCalendarRange(value)}
              onDayPress={onDayPress}
              minValue={minValue}
              maxValue={maxValue}
              isDateUnavailable={isDateUnavailable}
              defaultFocusedValue={defaultFocusedValue}
              autoFocus
            />
            {hasFooter && (
              <>
                <Divider />
                {(startTime || endTime) && (
                  <div className={styles.times}>
                    {startTime && <TimeOfDayField time={startTime} />}
                    {endTime && <TimeOfDayField time={endTime} />}
                  </div>
                )}
                {calendarNote}
              </>
            )}
          </Dialog>
        </Popover>
      </DialogTrigger>
    </div>
  );
};

export default DayPressRangePicker;
