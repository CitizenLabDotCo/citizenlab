import React from 'react';

import moment from 'moment-timezone';

import { IEventData } from 'api/events/types';

import { ScreenReaderOnly } from 'utils/a11y';
import { useIntl } from 'utils/cl-intl';
import { userTimezone } from 'utils/dateUtils';

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
  const { formatMessage } = useIntl();
  const startAtMoment = moment.tz(event.attributes.start_at, userTimezone);
  const endAtMoment = moment.tz(event.attributes.end_at, userTimezone);
  const tzLabel = startAtMoment.format('z');
  const isEventMultipleDays =
    startAtMoment.dayOfYear() !== endAtMoment.dayOfYear();

  return (
    <ScreenReaderOnly>
      {isEventMultipleDays ? (
        <p>
          {formatMessage(messages.multiDayScreenReaderDate, {
            startDate: startAtMoment.format('MMMM Do, YYYY'),
            startTime: startAtMoment.format('LT'),
            endDate: endAtMoment.format('MMMM Do, YYYY'),
            endTime: endAtMoment.format('LT'),
            timezone: tzLabel,
          })}
        </p>
      ) : (
        <p>
          {formatMessage(messages.singleDayScreenReaderDate, {
            eventDate: startAtMoment.format('MMMM Do, YYYY'),
            startTime: startAtMoment.format('LT'),
            endTime: endAtMoment.format('LT'),
            timezone: tzLabel,
          })}
        </p>
      )}
    </ScreenReaderOnly>
  );
};

export default ScreenReadableEventDate;
