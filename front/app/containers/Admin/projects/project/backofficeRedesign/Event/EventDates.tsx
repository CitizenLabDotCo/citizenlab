import React, { Dispatch, SetStateAction, useState } from 'react';

import {
  Box,
  Button,
  Icon,
  Text,
  Tooltip,
  colors,
} from '@citizenlab/cl2-component-library';
import { addMinutes, isSameDay } from 'date-fns';
import { CLErrors } from 'typings';

import { IEventProperties } from 'api/events/types';

import dateTimeMessages from 'containers/Admin/projects/project/events/components/DateTimeSelection/messages';
import eventMessages from 'containers/Admin/projects/project/events/messages';
import useEventDateTimes from 'containers/Admin/projects/project/events/useEventDateTimes';

import DateSinglePicker from 'components/admin/DatePickers/DateSinglePicker';
import TimeInput from 'components/admin/TimeSelection/TimeInput';
import Error from 'components/UI/Error';

import { useIntl } from 'utils/cl-intl';
import { getGmtOffset } from 'utils/dateUtils';

import messages from './messages';
import SetupCard from './SetupCard';

const withTimeOf = (date: Date, time: Date) => {
  const result = new Date(date);
  result.setHours(time.getHours(), time.getMinutes());
  return result;
};

const Arrow = () => (
  <Icon name="arrow-right" width="14px" height="14px" fill={colors.grey500} />
);

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
      <Box display="flex" alignItems="center" gap="8px">
        <DateSinglePicker
          id="event-start-date"
          selectedDate={startAtDate}
          onChange={(date) => updateStartAt(withTimeOf(date, startAtDate))}
        />
        {multiDay && (
          <>
            <Arrow />
            <DateSinglePicker
              id="event-end-date"
              selectedDate={endAtDate}
              onChange={(date) => updateEndAt(withTimeOf(date, endAtDate))}
            />
            <Tooltip
              content={formatMessage(messages.removeEndDate)}
              theme="dark"
            >
              <Button
                buttonStyle="bo-text"
                icon="close"
                width="32px"
                height="32px"
                padding="0"
                ariaLabel={formatMessage(messages.removeEndDate)}
                onClick={removeEndDate}
              />
            </Tooltip>
          </>
        )}
      </Box>

      <Box display="flex" alignItems="center" gap="8px">
        <TimeInput selectedTime={startAtDate} onChange={updateStartAt} />
        <Arrow />
        <TimeInput selectedTime={endAtDate} onChange={updateEndAt} />
      </Box>
      <Error apiErrors={errors?.start_at} />
      <Error apiErrors={errors?.end_at} />

      <Box display="flex" alignItems="center" justifyContent="space-between">
        {multiDay ? (
          <span />
        ) : (
          <Button
            buttonStyle="bo-text"
            padding="0 8px"
            onClick={() => setEndDateAdded(true)}
          >
            {formatMessage(messages.addEndDate)}
          </Button>
        )}
        {platformTimezone && (
          <Tooltip
            content={formatMessage(dateTimeMessages.timezoneInfo, {
              timezone: platformTimezone.replace(/_/g, ' '),
              gmtOffset: getGmtOffset(platformTimezone, tenantTimeNow),
            })}
            theme="dark"
          >
            <Box display="flex" alignItems="center" gap="6px" tabIndex={0}>
              <Icon
                name="globe"
                width="14px"
                height="14px"
                fill={colors.coolGrey600}
              />
              <Text as="span" m="0" fontSize="s" color="coolGrey600">
                {formatMessage(messages.platformTime, {
                  timezone: platformTimezone,
                })}
              </Text>
            </Box>
          </Tooltip>
        )}
      </Box>
    </SetupCard>
  );
};

export default EventDates;
