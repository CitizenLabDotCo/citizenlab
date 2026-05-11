import React from 'react';

import { Box, Label, Text } from '@citizenlab/cl2-component-library';
import { get } from 'lodash-es';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { IEventProperties } from 'api/events/types';

import DateSinglePicker from 'components/admin/DatePickers/DateSinglePicker';
import ErrorComponent from 'components/UI/Error';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import TimeInput from './TimeInput';
import { ErrorType } from './types';

interface Props {
  startAt: string;
  endAt: string;
  errors: ErrorType;
  setAttributeDiff: React.Dispatch<React.SetStateAction<IEventProperties>>;
}

const DateTimeSelection = ({
  startAt,
  endAt,
  errors,
  setAttributeDiff,
}: Props) => {
  const { formatMessage } = useIntl();
  const { data: appConfig } = useAppConfiguration();
  const platformTimezone =
    appConfig?.data.attributes.settings.core.timezone ?? '';
  const startAtDate = new Date(startAt);
  const endAtDate = new Date(endAt);

  const updateStartAt = (date: Date) => {
    const currentDifference = endAtDate.getTime() - startAtDate.getTime();

    setAttributeDiff((prev) => ({
      ...prev,
      start_at: date.toISOString(),
      end_at: new Date(date.getTime() + currentDifference).toISOString(),
    }));
  };

  const updateEndAt = (date: Date) => {
    let newStartAtDate = new Date(startAtDate);
    const newEndAtDateIsBeforeStartDate = date < startAtDate;

    if (newEndAtDateIsBeforeStartDate) {
      const currentDifference = endAtDate.getTime() - startAtDate.getTime();
      newStartAtDate = new Date(date.getTime() - currentDifference);
    }

    setAttributeDiff((prev) => ({
      ...prev,
      start_at: newStartAtDate.toISOString(),
      end_at: date.toISOString(),
    }));
  };

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
          {platformTimezone && (
            <Text
              m="0px"
              ml="8px"
              fontSize="s"
              color="coolGrey600"
              fontWeight="semi-bold"
            >
              {platformTimezone.replace(/_/g, ' ')}
            </Text>
          )}
        </Box>
        <ErrorComponent apiErrors={get(errors, 'start_at')} />
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
          {platformTimezone && (
            <Text
              m="0px"
              ml="8px"
              fontSize="s"
              color="coolGrey600"
              fontWeight="semi-bold"
            >
              {platformTimezone.replace(/_/g, ' ')}
            </Text>
          )}
        </Box>
        <ErrorComponent apiErrors={get(errors, 'end_at')} />
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
          })}
        </Text>
      )}
    </Box>
  );
};

export default DateTimeSelection;
