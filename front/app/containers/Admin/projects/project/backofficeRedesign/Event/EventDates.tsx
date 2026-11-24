import React, { Dispatch, SetStateAction, useState } from 'react';

import { addMinutes, isSameDay } from 'date-fns';
import { CLErrors } from 'typings';

import Button from 'design-system/Button';
import DatePicker from 'design-system/DatePicker';
import { CalendarDate, Time } from 'design-system/dates';
import IconButton from 'design-system/IconButton';
import TimeField from 'design-system/TimeField';

import { IEventProperties } from 'api/events/types';

import SetupCard from 'containers/Admin/projects/_shared/components/SetupCard';
import useEventDateTimes from 'containers/Admin/projects/_shared/events/useEventDateTimes';
import dateTimeMessages from 'containers/Admin/projects/project/events/components/DateTimeSelection/messages';
import eventMessages from 'containers/Admin/projects/project/events/messages';
import phaseSetupMessages from 'containers/Admin/projects/project/phaseSetup/messages';

import useApiErrorText from 'components/admin/MultilocFields/useApiErrorText';

import { useIntl } from 'utils/cl-intl';

import styles from './EventDates.module.css';
import messages from './messages';
import PlatformTimeNote from './PlatformTimeNote';
import 'design-system/tokens.css';

const withTimeOf = (date: Date, time: Date) => {
  const result = new Date(date);
  result.setHours(time.getHours(), time.getMinutes());
  return result;
};

// The pickers work on the design system's date values; the form keeps the
// platform wall-clock Dates, so values are converted only here.
const toCalendarDate = (date: Date) =>
  new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate());

const toTime = (date: Date) => new Time(date.getHours(), date.getMinutes());

const fromCalendarDate = (day: CalendarDate) =>
  new Date(day.year, day.month - 1, day.day);

const withPickedTime = (date: Date, time: Time) => {
  const result = new Date(date);
  result.setHours(time.hour, time.minute);
  return result;
};

interface Props {
  startAt: string;
  endAt: string;
  errors: CLErrors | null;
  setAttributeDiff: Dispatch<SetStateAction<IEventProperties>>;
}

const EventDates = ({ startAt, endAt, errors, setAttributeDiff }: Props) => {
  const { formatMessage } = useIntl();
  const {
    platformTimezone,
    startAtDate,
    endAtDate,
    tenantTimeNow,
    updateStartAt,
    updateEndAt,
  } = useEventDateTimes({ startAt, endAt, setAttributeDiff });
  const [endDateAdded, setEndDateAdded] = useState(false);
  const apiErrorText = useApiErrorText();
  const startError = apiErrorText(errors?.start_at);
  const endError = apiErrorText(errors?.end_at);
  // A time change can push the end past midnight, which shows the end date too.
  const multiDay = endDateAdded || !isSameDay(startAtDate, endAtDate);

  // Keeps the start where it is. An end time at or before the start time
  // would end the event before it begins, so it gets a new event's length.
  const removeEndDate = () => {
    setEndDateAdded(false);
    const end = withTimeOf(startAtDate, endAtDate);
    updateEndAt(end > startAtDate ? end : addMinutes(startAtDate, 30));
  };

  return (
    <SetupCard title={formatMessage(eventMessages.eventDates)}>
      <div className={styles.grid}>
        <DatePicker
          id="event-start-date"
          label={formatMessage(phaseSetupMessages.startDate)}
          value={toCalendarDate(startAtDate)}
          onChange={(day) => {
            if (day) {
              updateStartAt(withTimeOf(fromCalendarDate(day), startAtDate));
            }
          }}
          isInvalid={!!startError}
          errorMessage={startError}
        />
        {multiDay ? (
          <div className={styles.endDate}>
            <div className={styles.endDatePicker}>
              <DatePicker
                id="event-end-date"
                label={formatMessage(phaseSetupMessages.endDate)}
                value={toCalendarDate(endAtDate)}
                onChange={(day) => {
                  if (day) {
                    updateEndAt(withTimeOf(fromCalendarDate(day), endAtDate));
                  }
                }}
                isInvalid={!!endError}
                errorMessage={endError}
              />
            </div>
            <div className={styles.removeEndDate}>
              <IconButton
                icon="x-14"
                size={24}
                aria-label={formatMessage(messages.removeEndDate)}
                onPress={removeEndDate}
              />
            </div>
          </div>
        ) : (
          <span />
        )}

        <TimeField
          label={formatMessage(dateTimeMessages.dateStartLabel)}
          value={toTime(startAtDate)}
          onChange={(time) => {
            if (time) updateStartAt(withPickedTime(startAtDate, time));
          }}
        />
        <TimeField
          label={formatMessage(dateTimeMessages.datesEndLabel)}
          value={toTime(endAtDate)}
          onChange={(time) => {
            if (time) updateEndAt(withPickedTime(endAtDate, time));
          }}
          isInvalid={!multiDay && !!endError}
          errorMessage={multiDay ? undefined : endError}
        />
      </div>

      <div className={styles.footer}>
        {multiDay ? (
          <span />
        ) : (
          <Button
            variant="quiet"
            size={28}
            onPress={() => setEndDateAdded(true)}
          >
            {formatMessage(messages.addEndDate)}
          </Button>
        )}
        {platformTimezone && (
          <PlatformTimeNote timezone={platformTimezone} now={tenantTimeNow} />
        )}
      </div>
    </SetupCard>
  );
};

export default EventDates;
