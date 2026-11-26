import React, { ReactNode, useState } from 'react';

import {
  CalendarDate,
  CalendarDateTime,
  toCalendarDate,
} from '@internationalized/date';
import {
  Button as AriaButton,
  DatePicker as AriaDatePicker,
  DateValue,
  Dialog,
  Group,
  I18nProvider,
  Popover,
  useLocale,
} from 'react-aria-components';

import { useIntl } from 'utils/cl-intl';

import Button from '../Button';
import { DayPressCalendar, OpenRangeValue } from '../Calendar';
import DateSegments from '../DateField/DateSegments';
import dayFirstLocale from '../DateField/dayFirstLocale';
import pickerStyles from '../DatePicker/DatePicker.module.css';
import Divider from '../Divider';
import Icon from '../Icon';
import IconButton from '../IconButton';

import styles from './DateRangePicker.module.css';
import messages from './messages';
import TimeOfDayField, { TimeOfDay } from './TimeOfDayField';
import '../tokens.css';

type Props = {
  // There is no visible label (a card title names it), so this names it.
  'aria-label': string;
  'aria-describedby'?: string;
  isInvalid?: boolean;
  // An end of null is an open end.
  value: OpenRangeValue<CalendarDateTime> | null;
  onDayPress: (date: CalendarDate) => void;
  // A typed start or end day. The caller applies its own rules, so a typed
  // day it refuses stays in the box, marked invalid.
  onStartChange: (date: CalendarDate) => void;
  onEndChange: (date: CalendarDate) => void;
  onRemoveEnd: () => void;
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

const isSameDay = (a: CalendarDate | null, b: CalendarDate | null) =>
  a === b || (!!a && !!b && a.compare(b) === 0);

type DayFieldProps = {
  'aria-label': string;
  'aria-describedby'?: string;
  day: CalendarDate | null;
  onChange: (day: CalendarDate) => void;
  isInvalid?: boolean;
  isRefused: (day: CalendarDate) => boolean;
  minValue?: DateValue;
  maxValue?: DateValue;
  isDateUnavailable?: (date: DateValue) => boolean;
  autoFocus?: boolean;
  calendarLabel: string;
  dialogLabel: string;
  calendar: ReactNode;
  onOpenChange?: (isOpen: boolean) => void;
};

// One typeable day (dd / mm / yyyy) with the button that opens the calendar.
const DayField = ({
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  day,
  onChange,
  isInvalid,
  isRefused,
  minValue,
  maxValue,
  isDateUnavailable,
  autoFocus,
  calendarLabel,
  dialogLabel,
  calendar,
  onOpenChange,
}: DayFieldProps) => {
  const { locale } = useLocale();
  // React Aria resets a controlled field whose value doesn't follow the
  // typing, so the box keeps what was typed until the caller sends a new day.
  const [typed, setTyped] = useState(day);
  const [savedDay, setSavedDay] = useState(day);

  if (!isSameDay(day, savedDay)) {
    setSavedDay(day);
    setTyped(day);
  }

  const refused = !!typed && !isSameDay(typed, day) && isRefused(typed);

  return (
    <I18nProvider locale={dayFirstLocale(locale)}>
      <AriaDatePicker<CalendarDate>
        className={styles.dayField}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        value={typed}
        onChange={(value) => {
          setTyped(value);
          if (value && !isRefused(value)) onChange(value);
        }}
        isInvalid={isInvalid || refused}
        minValue={minValue}
        maxValue={maxValue}
        isDateUnavailable={isDateUnavailable}
        autoFocus={autoFocus}
        firstDayOfWeek="mon"
        shouldForceLeadingZeros
        onOpenChange={onOpenChange}
      >
        <Group className={`${pickerStyles.box} ${pickerStyles.size36}`}>
          <DateSegments className={pickerStyles.segments} />
          <AriaButton
            className={pickerStyles.calendarButton}
            aria-label={calendarLabel}
          >
            <Icon name="calendar-16" />
          </AriaButton>
        </Group>
        <Popover
          className={pickerStyles.popover}
          placement="bottom start"
          offset={4}
        >
          {/* The times under the calendar keep the platform's own clock. */}
          <I18nProvider locale={locale}>
            <Dialog
              className={`${pickerStyles.dialog} ${styles.dialog}`}
              aria-label={dialogLabel}
            >
              {calendar}
            </Dialog>
          </I18nProvider>
        </Popover>
      </AriaDatePicker>
    </I18nProvider>
  );
};

// A phase-style date range: a typeable start day, then either "Add end date"
// or a typeable end day that can be removed again. Both days open one
// calendar, whose day presses go to the caller, with optional times of day.
const DayPressRangePicker = ({
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  isInvalid,
  value,
  onDayPress,
  onStartChange,
  onEndChange,
  onRemoveEnd,
  minValue,
  maxValue,
  isDateUnavailable,
  defaultFocusedValue,
  startTime,
  endTime,
  calendarNote,
  onOpenChange,
}: Props) => {
  const { formatMessage } = useIntl();
  const [addingEnd, setAddingEnd] = useState(false);

  const range = toCalendarRange(value);
  const start = range?.start ?? null;
  const end = value?.end ? range?.end ?? null : null;
  const showEnd = !!end || addingEnd;
  const hasFooter = !!startTime || !!endTime || !!calendarNote;

  const unavailable = (day: CalendarDate) =>
    !!isDateUnavailable?.(day) ||
    (!!minValue && day.compare(minValue) < 0) ||
    (!!maxValue && day.compare(maxValue) > 0);

  // A typed range may not run across an unavailable day, as the calendar's
  // day presses can't either.
  const crossesUnavailable = (from: CalendarDate, to: CalendarDate) => {
    if (!isDateUnavailable) return false;
    for (let day = from; day.compare(to) <= 0; day = day.add({ days: 1 })) {
      if (isDateUnavailable(day)) return true;
    }
    return false;
  };

  const calendar = (
    <>
      <DayPressCalendar
        value={range}
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
    </>
  );

  const shared = {
    'aria-describedby': ariaDescribedBy,
    isInvalid,
    minValue,
    maxValue,
    isDateUnavailable,
    calendarLabel: formatMessage(messages.openCalendar),
    dialogLabel: ariaLabel,
    calendar,
    onOpenChange,
  };

  return (
    <div className={styles.range}>
      <DayField
        {...shared}
        aria-label={formatMessage(messages.startDate)}
        day={start}
        onChange={onStartChange}
        isRefused={(day) =>
          unavailable(day) ||
          (!!end && (day.compare(end) > 0 || crossesUnavailable(day, end)))
        }
      />
      {showEnd ? (
        <>
          <span className={styles.arrow} aria-hidden>
            →
          </span>
          <DayField
            {...shared}
            aria-label={formatMessage(messages.endDate)}
            day={end}
            onChange={(day) => {
              setAddingEnd(false);
              onEndChange(day);
            }}
            isRefused={(day) =>
              unavailable(day) ||
              (!!start &&
                (day.compare(start) < 0 || crossesUnavailable(start, day)))
            }
            autoFocus={addingEnd && !end}
          />
          <IconButton
            icon="x-16"
            size={28}
            aria-label={formatMessage(messages.removeEndDate)}
            onPress={() => {
              setAddingEnd(false);
              if (end) onRemoveEnd();
            }}
          />
        </>
      ) : (
        start && (
          <Button variant="quiet" onPress={() => setAddingEnd(true)}>
            {formatMessage(messages.addEndDate)}
          </Button>
        )
      )}
    </div>
  );
};

export default DayPressRangePicker;
