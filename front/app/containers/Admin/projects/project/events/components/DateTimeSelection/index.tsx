import React from 'react';

import { Box, Label, Text } from '@citizenlab/cl2-component-library';
import moment from 'moment-timezone';
import { CLErrors } from 'typings';

import { IEventProperties } from 'api/events/types';

import DateSinglePicker from 'components/admin/DatePickers/DateSinglePicker';
import TimeInput from 'components/admin/TimeSelection/TimeInput';
import ErrorComponent from 'components/UI/Error';

import { useIntl } from 'utils/cl-intl';
import { getGmtOffset } from 'utils/dateUtils';

import useEventDateTimes from '../../useEventDateTimes';

import messages from './messages';

interface Props {
  startAt: string;
  endAt: string;
  errors: CLErrors | null;
  setAttributeDiff: React.Dispatch<React.SetStateAction<IEventProperties>>;
}

const DateTimeSelection = ({
  startAt,
  endAt,
  errors,
  setAttributeDiff,
}: Props) => {
  const { formatMessage } = useIntl();
  const {
    platformTimezone,
    startAtDate,
    endAtDate,
    tenantTimeNow,
    updateStartAt,
    updateEndAt,
  } = useEventDateTimes({ startAt, endAt, setAttributeDiff });

  const browserTimezone = moment.tz.guess();
  const startGmtOffset = getGmtOffset(
    platformTimezone,
    tenantTimeNow,
    startAtDate
  );
  const startBrowserOffset = getGmtOffset(
    browserTimezone,
    tenantTimeNow,
    startAtDate
  );
  const showStartGmtOffset =
    !!platformTimezone && startGmtOffset !== startBrowserOffset;
  const endGmtOffset = getGmtOffset(platformTimezone, tenantTimeNow, endAtDate);
  const endBrowserOffset = getGmtOffset(
    browserTimezone,
    tenantTimeNow,
    endAtDate
  );
  const showEndGmtOffset =
    !!platformTimezone && endGmtOffset !== endBrowserOffset;

  return (
    <Box display="flex" flexDirection="column" maxWidth="400px">
      <Box>
        <Label>{formatMessage(messages.dateStartLabel)}</Label>
        <Box display="flex" flexDirection="row" alignItems="center">
          <DateSinglePicker
            selectedDate={startAtDate}
            placement="top"
            onChange={(date) => {
              const h = startAtDate.getHours();
              const m = startAtDate.getMinutes();
              date.setHours(h);
              date.setMinutes(m);
              updateStartAt(date);
            }}
          />
          <Box ml="12px">
            <TimeInput selectedTime={startAtDate} onChange={updateStartAt} />
          </Box>
          {showStartGmtOffset && (
            <Text
              m="0px"
              ml="8px"
              fontSize="s"
              color="coolGrey600"
              fontWeight="semi-bold"
            >
              GMT{startGmtOffset}
            </Text>
          )}
        </Box>
        <ErrorComponent apiErrors={errors?.start_at} />
      </Box>

      <Box mt="12px">
        <Label>{formatMessage(messages.datesEndLabel)}</Label>
        <Box display="flex" flexDirection="row" alignItems="center">
          <DateSinglePicker
            selectedDate={endAtDate}
            onChange={(date) => {
              const h = endAtDate.getHours();
              const m = endAtDate.getMinutes();
              date.setHours(h);
              date.setMinutes(m);
              updateEndAt(date);
            }}
          />
          <Box ml="12px">
            <TimeInput selectedTime={endAtDate} onChange={updateEndAt} />
          </Box>
          {showEndGmtOffset && (
            <Text
              m="0px"
              ml="8px"
              fontSize="s"
              color="coolGrey600"
              fontWeight="semi-bold"
            >
              GMT{endGmtOffset}
            </Text>
          )}
        </Box>
        <ErrorComponent apiErrors={errors?.end_at} />
      </Box>

      {platformTimezone && (
        <Text
          mt="12px"
          mb="0px"
          fontSize="s"
          color="coolGrey600"
          fontStyle="italic"
        >
          {formatMessage(messages.timezoneInfo, {
            timezone: platformTimezone.replace(/_/g, ' '),
            gmtOffset: getGmtOffset(platformTimezone, tenantTimeNow),
          })}
        </Text>
      )}
    </Box>
  );
};

export default DateTimeSelection;
