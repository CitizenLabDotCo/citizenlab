import React, { useState } from 'react';

import { endOfMonth, startOfMonth } from 'date-fns';
import moment from 'moment-timezone';

import Banner from 'design-system/Banner';
import DateRangePicker from 'design-system/DateRangePicker';
import {
  AnyCalendarDate,
  CalendarDate,
  CalendarDateTime,
  Time,
} from 'design-system/dates';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import { useIntl } from 'utils/cl-intl';

import sharedMessages from '../_shared/messages';
import { DateRange } from '../_shared/typings';

import { getEndMonth, getStartMonth } from './Calendar/utils/getStartEndMonth';
import { isDayUnavailable } from './Calendar/utils/isDayUnavailable';
import {
  getDisplayTimes,
  getRangeAfterDayClick,
  isSingleDayRange,
  withTime,
} from './Calendar/utils/timeSelection';
import { getEndTimeMaxTime, getStartTimeMinTime } from './Calendar/utils/utils';
import styles from './DesignSystemPicker.module.css';
import { isSelectedRangeOpenEnded } from './isSelectedRangeOpenEnded';
import messages from './messages';
import 'design-system/tokens.css';

const toDay = (date: Date) =>
  new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate());

const toDateTime = (date: Date) =>
  new CalendarDateTime(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    date.getHours(),
    date.getMinutes()
  );

const toTime = (date: Date) => new Time(date.getHours(), date.getMinutes());

const fromDay = (day: AnyCalendarDate) =>
  new Date(day.year, day.month - 1, day.day);

// The time inputs hand over a Date carrying the picked time, as the
// calendar's own time inputs do.
const fromTime = (time: Time, base: Date) => {
  const date = new Date(base);
  date.setHours(time.hour);
  date.setMinutes(time.minute);
  return date;
};

interface Props {
  label: string;
  'aria-describedby'?: string;
  isInvalid?: boolean;
  selectedRange: Partial<DateRange>;
  disabledRanges: DateRange[];
  startMonth?: Date;
  defaultMonth?: Date;
  onUpdateRange: (range: Partial<DateRange>) => void;
  className?: string;
}

const DesignSystemPicker = ({
  label,
  'aria-describedby': ariaDescribedBy,
  isInvalid,
  selectedRange,
  disabledRanges,
  startMonth,
  defaultMonth,
  onUpdateRange,
  className,
}: Props) => {
  const { formatMessage } = useIntl();
  const { data: tenant } = useAppConfiguration();
  const timeZone = tenant?.data.attributes.settings.core.timezone;
  const gmtOffset = timeZone ? moment().tz(timeZone).format('Z') : '';

  const [selectedStartTime, setSelectedStartTime] = useState<Date | null>(null);
  const [selectedEndTime, setSelectedEndTime] = useState<Date | null>(null);

  const { from, to } = selectedRange;
  const { startTime, endTime } = getDisplayTimes({
    selectedRange,
    disabledRanges,
    selectedStartTime,
    selectedEndTime,
  });
  const startMinTime = getStartTimeMinTime(from, disabledRanges);
  const endMaxTime = getEndTimeMaxTime(to, disabledRanges);
  const selectDate = formatMessage(sharedMessages.selectDate);
  const openEnded = formatMessage(messages.openEnded);

  const firstMonth = getStartMonth({
    startMonth,
    selectedRange,
    disabledRanges,
    defaultMonth,
  });
  const lastMonth = getEndMonth({
    selectedRange,
    disabledRanges,
    defaultMonth,
  });

  // Picked times only last while the calendar is open.
  const handleOpenChange = () => {
    setSelectedStartTime(null);
    setSelectedEndTime(null);
  };

  const handleDayPress = (date: CalendarDate) => {
    setSelectedStartTime(null);
    setSelectedEndTime(null);

    const day = fromDay(date);
    if (isDayUnavailable(day, disabledRanges)) return;

    const range = getRangeAfterDayClick({
      selectedRange,
      disabledRanges,
      clickedDate: day,
      startTime,
      endTime,
    });

    if (range.startTime) setSelectedStartTime(range.startTime);
    if (range.endTime) setSelectedEndTime(range.endTime);

    onUpdateRange(range.range);
  };

  const handleStartTimeChange = (time: Time) => {
    const newTime = fromTime(time, startTime);
    setSelectedStartTime(newTime);
    if (!from) return;
    onUpdateRange({ from: withTime(from, newTime), to });
  };

  const handleEndTimeChange = (time: Time) => {
    const newTime = fromTime(time, endTime);
    setSelectedEndTime(newTime);
    if (!to) return;
    onUpdateRange({ from, to: withTime(to, newTime) });
  };

  const isSingleDay = isSingleDayRange(selectedRange);

  return (
    <div className={`e2e-date-phase-picker-input ${className}-input`}>
      <DateRangePicker
        aria-label={label}
        aria-describedby={ariaDescribedBy}
        isInvalid={isInvalid}
        value={
          from
            ? { start: toDateTime(from), end: to ? toDateTime(to) : null }
            : null
        }
        onDayPress={handleDayPress}
        onOpenChange={handleOpenChange}
        startPlaceholder={selectDate}
        endPlaceholder={
          isSelectedRangeOpenEnded(selectedRange, disabledRanges)
            ? openEnded
            : selectDate
        }
        minValue={toDay(startOfMonth(firstMonth))}
        maxValue={toDay(endOfMonth(lastMonth))}
        isDateUnavailable={(date) =>
          isDayUnavailable(fromDay(date), disabledRanges)
        }
        defaultFocusedValue={toDay(defaultMonth ?? new Date())}
        startTime={
          isSingleDay
            ? undefined
            : {
                label: formatMessage(messages.startTime),
                value: toTime(startTime),
                minValue: startMinTime ? toTime(startMinTime) : undefined,
                onChange: handleStartTimeChange,
              }
        }
        endTime={
          isSingleDay
            ? undefined
            : {
                label: formatMessage(messages.endTime),
                value: to ? toTime(endTime) : null,
                maxValue: endMaxTime ? toTime(endMaxTime) : undefined,
                isDisabled: !to,
                description: to ? undefined : openEnded,
                onChange: handleEndTimeChange,
              }
        }
        calendarNote={
          isSingleDay && (
            <div className={styles.note}>
              <p className={styles.noteTitle}>
                {formatMessage(messages.sameDaySelection)}
              </p>
              <Banner tone="warning">
                {formatMessage(messages.sameDaySelectionWarning, {
                  timezone: gmtOffset,
                })}
              </Banner>
            </div>
          )
        }
      />
    </div>
  );
};

export default DesignSystemPicker;
