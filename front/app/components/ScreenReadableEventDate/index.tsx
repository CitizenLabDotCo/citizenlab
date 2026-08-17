import React from 'react';

import { IEventData } from 'api/events/types';

import useLocale from 'hooks/useLocale';

import { ScreenReaderOnly } from 'utils/a11y';
import { useIntl } from 'utils/cl-intl';
import {
  formatLongDate,
  formatTime,
  formatTimeZoneAbbreviation,
  getViewerZone,
  isSameDayInZone,
} from 'utils/dateFormat';

import messages from './messages';

interface Props {
  event: IEventData;
}

/**
 * ScreenReadableEventDate:
 * A component that renders a screen-readable event date.
 * We use this component for reuse. It is important that the
 * dates for the event are read out in a way that makes it
 * easy for a user using a screen reader to understand the date.
 */
const ScreenReadableEventDate = ({ event }: Props) => {
  const locale = useLocale();
  const { formatMessage } = useIntl();
  const { start_at, end_at } = event.attributes;
  // Event times read in the VIEWER's zone, with the zone named explicitly.
  const inViewerZone = { timeZone: getViewerZone() };
  const tzLabel = formatTimeZoneAbbreviation(start_at, locale, inViewerZone);
  const isEventMultipleDays = !isSameDayInZone(
    start_at,
    end_at,
    inViewerZone.timeZone
  );

  return (
    <ScreenReaderOnly>
      {isEventMultipleDays ? (
        <p>
          {formatMessage(messages.multiDayScreenReaderDate, {
            startDate: formatLongDate(start_at, locale, inViewerZone),
            startTime: formatTime(start_at, locale, inViewerZone),
            endDate: formatLongDate(end_at, locale, inViewerZone),
            endTime: formatTime(end_at, locale, inViewerZone),
            timezone: tzLabel,
          })}
        </p>
      ) : (
        <p>
          {formatMessage(messages.singleDayScreenReaderDate, {
            eventDate: formatLongDate(start_at, locale, inViewerZone),
            startTime: formatTime(start_at, locale, inViewerZone),
            endTime: formatTime(end_at, locale, inViewerZone),
            timezone: tzLabel,
          })}
        </p>
      )}
    </ScreenReaderOnly>
  );
};

export default ScreenReadableEventDate;
