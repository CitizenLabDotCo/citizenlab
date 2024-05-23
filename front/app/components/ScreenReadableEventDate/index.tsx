import React from 'react';

import moment from 'moment';

import { IEventData } from 'api/events/types';

import { ScreenReaderOnly } from 'utils/a11y';
import { useIntl } from 'utils/cl-intl';

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
  const startAtMoment = moment(event.attributes.start_at);
  const endAtMoment = moment(event.attributes.end_at);
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
          })}
        </p>
      ) : (
        <p>
          {formatMessage(messages.singleDayScreenReaderDate, {
            eventDate: startAtMoment.format('MMMM Do, YYYY'),
            startTime: startAtMoment.format('LT'),
            endTime: endAtMoment.format('LT'),
          })}
        </p>
      )}
    </ScreenReaderOnly>
  );
};

export default ScreenReadableEventDate;
