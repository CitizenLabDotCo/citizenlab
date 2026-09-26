import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import { IEventData } from 'api/events/types';

import useLocale from 'hooks/useLocale';

import ScreenReadableEventDate from 'components/ScreenReadableEventDate';

import {
  formatDayOfMonth,
  formatMonthShort,
  formatTime,
  formatTimeZoneAbbreviation,
  getViewerZone,
  isSameDayInZone,
} from 'utils/dateFormat';

import SingleDateStylized from './SingleDateStylized';

interface Props {
  event: IEventData;
}

const EventDateStylized = ({ event }: Props) => {
  const locale = useLocale();
  const theme = useTheme();
  const { start_at, end_at } = event.attributes;
  const inViewerZone = { timeZone: getViewerZone() };
  const startDateMonth = formatMonthShort(start_at, locale, inViewerZone);
  const endDateMonth = formatMonthShort(end_at, locale, inViewerZone);
  const tzLabel = formatTimeZoneAbbreviation(start_at, locale, inViewerZone);
  const isEventMultipleDays = !isSameDayInZone(
    start_at,
    end_at,
    inViewerZone.timeZone
  );
  const oneDayEventTime = `${formatTime(
    start_at,
    locale,
    inViewerZone
  )} - ${formatTime(end_at, locale, inViewerZone)} ${tzLabel}`;

  return (
    <Box
      display="flex"
      flexDirection={theme.isRtl ? 'row-reverse' : 'row'}
      justifyContent="center"
      id="e2e-event-date-stylized"
    >
      <ScreenReadableEventDate event={event} />
      {/* We need to wrap the single date in a div to make sure it's
        not read by screen readers. This is because we handle the screen
        reader output in the ScreenReadableEventDate component
        */}
      <div aria-hidden="true">
        <SingleDateStylized
          day={formatDayOfMonth(start_at, locale, inViewerZone)}
          month={startDateMonth}
          time={
            isEventMultipleDays
              ? `${formatTime(start_at, locale, inViewerZone)} ${tzLabel}`
              : oneDayEventTime
          }
        />
      </div>
      {isEventMultipleDays && (
        <>
          <Box mx="16px" my="auto" aria-hidden>
            <Text m="0px" fontWeight="bold" fontSize="xxl">
              {theme.isRtl ? '←' : '→'}
            </Text>
          </Box>
          <div aria-hidden>
            <SingleDateStylized
              day={formatDayOfMonth(end_at, locale, inViewerZone)}
              month={endDateMonth}
              time={`${formatTime(end_at, locale, inViewerZone)} ${tzLabel}`}
            />
          </div>
        </>
      )}
    </Box>
  );
};

export default EventDateStylized;
