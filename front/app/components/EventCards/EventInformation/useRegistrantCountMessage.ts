import { IEventData } from 'api/events/types';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

function useRegistrantCountMessage(event: IEventData) {
  const { formatMessage } = useIntl();

  return typeof event.attributes.maximum_attendees === 'number'
    ? formatMessage(messages.registrantCountWithMaximum, {
        attendeesCount: event.attributes.attendees_count,
        maximumNumberOfAttendees: event.attributes.maximum_attendees,
      })
    : formatMessage(messages.registrantCount, {
        attendeesCount: event.attributes.attendees_count,
      });
}

export default useRegistrantCountMessage;
