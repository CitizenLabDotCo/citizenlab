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
  LabelContext,
  Popover,
  useLocale,
} from 'react-aria-components';

import { OpenRangeValue, RangeCalendar } from '../Calendar';
import pickerStyles from '../DatePicker/DatePicker.module.css';
import Divider from '../Divider';
import { FieldHelp, FieldLabel, fieldStyles } from '../Field';
import Icon from '../Icon';
import '../tokens.css';

import styles from './DateRangePicker.module.css';
import TimeOfDayField, { TimeOfDay } from './TimeOfDayField';

export type DayPressLabelProps =
  | { label: ReactNode; 'aria-label'?: string }
  // Without a label (a card title names it), the picker needs an aria-label.
  | { label?: undefined; 'aria-label': string };

export type DayPressBaseProps = {
  description?: ReactNode;
  size?: 36 | 32;
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
  isDisabled?: boolean;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  'data-cy'?: string;
};

type Props = DayPressBaseProps & {
  label?: ReactNode;
  'aria-label'?: string;
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
  label,
  'aria-label': ariaLabel,
  description,
  size = 36,
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
  isDisabled,
  isOpen,
  defaultOpen,
  onOpenChange,
  'data-cy': dataCy,
}: Props) => {
  const labelId = useId();
  const valueId = useId();
  const { locale } = useLocale();
  const formatter = useMemo(
    () =>
      new DateFormatter(locale, {
        dateStyle: 'short',
        timeStyle: 'short',
        hourCycle: 'h23',
      }),
    [locale]
  );
  const format = (date: CalendarDateTime) =>
    formatter.format(date.toDate(getLocalTimeZone()));

  const hasFooter = !!startTime || !!endTime || !!calendarNote;

  return (
    <div
      className={styles.picker}
      data-disabled={isDisabled || undefined}
      data-cy={dataCy}
    >
      {label && (
        <LabelContext.Provider value={{ id: labelId, elementType: 'span' }}>
          <FieldLabel>{label}</FieldLabel>
        </LabelContext.Provider>
      )}
      <div className={fieldStyles.control}>
        <DialogTrigger
          isOpen={isOpen}
          defaultOpen={defaultOpen}
          onOpenChange={onOpenChange}
        >
          <Button
            className={`${pickerStyles.box} ${pickerStyles[`size${size}`]} ${
              styles.trigger
            }`}
            isDisabled={isDisabled}
            aria-label={label ? undefined : ariaLabel}
            aria-labelledby={label ? `${labelId} ${valueId}` : undefined}
            aria-describedby={label ? undefined : valueId}
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
              aria-label={label ? undefined : ariaLabel}
              aria-labelledby={label ? labelId : undefined}
            >
              <RangeCalendar
                value={toCalendarRange(value)}
                onDayPress={onDayPress}
                minValue={minValue}
                maxValue={maxValue}
                isDateUnavailable={isDateUnavailable}
                defaultFocusedValue={defaultFocusedValue}
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
        <FieldHelp description={description} />
      </div>
    </div>
  );
};

export default DayPressRangePicker;
