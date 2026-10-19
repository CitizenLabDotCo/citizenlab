import React from 'react';

import { Box, Label, Text } from '@citizenlab/cl2-component-library';
import { get } from 'lodash-es';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { IEventProperties } from 'api/events/types';

import DateSinglePicker from 'components/admin/DatePickers/DateSinglePicker';
import TimeInput from 'components/admin/TimeSelection/TimeInput';
import ErrorComponent from 'components/UI/Error';

import { useIntl } from 'utils/cl-intl';
import { getViewerZone } from 'utils/dateFormat';
import {
  convertToTimeZoneISO,
  getDateInTimezone,
  getGmtOffset,
  nowInZone,
} from 'utils/dateUtils';

import messages from './messages';
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

  // Pickers operate on JS Dates in the *browser* tz. To make them display
  // wall-clock values in the platform tz, we project the stored UTC instant
  // into the platform tz and rebuild a Date whose browser-tz components
  // match those platform-tz wall-clock values.
  const toPickerDate = (iso: string) =>
    platformTimezone
      ? getDateInTimezone(iso, platformTimezone) ?? new Date(iso)
      : new Date(iso);

  // Inverse of toPickerDate: treat the picker Date's wall-clock components
  // as platform-tz values and return the corresponding UTC ISO string.
  const fromPickerDate = (date: Date) => {
    if (!platformTimezone) return date.toISOString();
    const withoutSeconds = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      0
    );
    return convertToTimeZoneISO(withoutSeconds, platformTimezone);
  };

  const startAtDate = toPickerDate(startAt);
  const endAtDate = toPickerDate(endAt);

  const tenantTimeNow = nowInZone(platformTimezone);
  const browserTimezone = getViewerZone();
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

  const updateStartAt = (date: Date) => {
    // Preserve real (UTC) duration so DST transitions don't stretch/shrink the event
    const currentDurationMs =
      new Date(endAt).getTime() - new Date(startAt).getTime();

    const newStartIso = fromPickerDate(date);
    const newEndIso = new Date(
      new Date(newStartIso).getTime() + currentDurationMs
    ).toISOString();

    setAttributeDiff((prev) => ({
      ...prev,
      start_at: newStartIso,
      end_at: newEndIso,
    }));
  };

  const updateEndAt = (date: Date) => {
    const newEndIso = fromPickerDate(date);
    const newEndMs = new Date(newEndIso).getTime();
    const oldStartMs = new Date(startAt).getTime();

    let newStartIso = startAt;
    if (newEndMs < oldStartMs) {
      const currentDurationMs = new Date(endAt).getTime() - oldStartMs;
      newStartIso = new Date(newEndMs - currentDurationMs).toISOString();
    }

    setAttributeDiff((prev) => ({
      ...prev,
      start_at: newStartIso,
      end_at: newEndIso,
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
            gmtOffset: getGmtOffset(platformTimezone, tenantTimeNow),
          })}
        </Text>
      )}
    </Box>
  );
};

export default DateTimeSelection;
