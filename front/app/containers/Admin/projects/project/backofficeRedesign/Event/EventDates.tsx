import React, { Dispatch, SetStateAction, useState } from 'react';

import {
  Box,
  Button,
  Icon,
  Tooltip,
  bo,
  colors,
} from '@citizenlab/cl2-component-library';
import { addMinutes, isSameDay } from 'date-fns';
import { CLErrors } from 'typings';

import { IEventProperties } from 'api/events/types';

import useEventDateTimes from 'containers/Admin/projects/_shared/events/useEventDateTimes';
import eventMessages from 'containers/Admin/projects/project/events/messages';

import DateSinglePicker from 'components/admin/DatePickers/DateSinglePicker';
import TimeInput from 'components/admin/TimeSelection/TimeInput';
import Error from 'components/UI/Error';

import { useIntl } from 'utils/cl-intl';

import DateFieldRow from './DateFieldRow';
import DateFieldSegment from './DateFieldSegment';
import messages from './messages';
import PlatformTimeNote from './PlatformTimeNote';
import SetupCard from './SetupCard';

const withTimeOf = (date: Date, time: Date) => {
  const result = new Date(date);
  result.setHours(time.getHours(), time.getMinutes());
  return result;
};

const Arrow = () => (
  <Icon
    name="arrow-right"
    width="14px"
    height="14px"
    fill={bo.colors.crumbSeparator}
  />
);

interface Props {
  startAt: string;
  endAt: string;
  errors: CLErrors | null;
  setAttributeDiff: Dispatch<SetStateAction<IEventProperties>>;
}

const EventDates = ({ startAt, endAt, errors, setAttributeDiff }: Props) => {
  const { formatMessage, formatDate } = useIntl();
  const formatLongDate = (date: Date) =>
    formatDate(date, {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  const {
    platformTimezone,
    startAtDate,
    endAtDate,
    tenantTimeNow,
    updateStartAt,
    updateEndAt,
  } = useEventDateTimes({ startAt, endAt, setAttributeDiff });
  const [endDateAdded, setEndDateAdded] = useState(false);
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
      <DateFieldRow icon="calendar">
        <DateFieldSegment>
          <DateSinglePicker
            id="event-start-date"
            selectedDate={startAtDate}
            formatDate={formatLongDate}
            onChange={(date) => updateStartAt(withTimeOf(date, startAtDate))}
          />
        </DateFieldSegment>
        {multiDay && (
          <>
            <Arrow />
            <DateFieldSegment>
              <DateSinglePicker
                id="event-end-date"
                selectedDate={endAtDate}
                formatDate={formatLongDate}
                onChange={(date) => updateEndAt(withTimeOf(date, endAtDate))}
              />
            </DateFieldSegment>
            <Box ml="auto">
              <Tooltip
                content={formatMessage(messages.removeEndDate)}
                theme="dark"
              >
                <Button
                  buttonStyle="bo-text"
                  icon="close"
                  iconSize="14px"
                  width="24px"
                  height="24px"
                  padding="0"
                  ariaLabel={formatMessage(messages.removeEndDate)}
                  onClick={removeEndDate}
                />
              </Tooltip>
            </Box>
          </>
        )}
      </DateFieldRow>

      <DateFieldRow icon="clock">
        <DateFieldSegment>
          <TimeInput selectedTime={startAtDate} onChange={updateStartAt} />
        </DateFieldSegment>
        <Arrow />
        <DateFieldSegment>
          <TimeInput selectedTime={endAtDate} onChange={updateEndAt} />
        </DateFieldSegment>
      </DateFieldRow>
      <Error apiErrors={errors?.start_at} />
      <Error apiErrors={errors?.end_at} />

      <Box display="flex" alignItems="center" justifyContent="space-between">
        {multiDay ? (
          <span />
        ) : (
          <Button
            buttonStyle="bo-text"
            padding="2px"
            height="auto"
            fontSize={`${bo.controlFontSize}px`}
            fontWeight="400"
            textColor={colors.coolGrey600}
            textHoverColor={bo.colors.textHeadingStrong}
            onClick={() => setEndDateAdded(true)}
          >
            {formatMessage(messages.addEndDate)}
          </Button>
        )}
        {platformTimezone && (
          <PlatformTimeNote timezone={platformTimezone} now={tenantTimeNow} />
        )}
      </Box>
    </SetupCard>
  );
};

export default EventDates;
