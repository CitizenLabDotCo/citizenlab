import React from 'react';
import EventsViewer from './EventsViewer';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

type Props = {
  attendeeId?: string;
};
const PastEvents = ({ attendeeId }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <EventsViewer
      showProjectFilter={true}
      title={formatMessage(messages.pastEvents)}
      fallbackMessage={messages.noPastEvents}
      eventsTime="past"
      projectPublicationStatuses={['published']}
      attendeeId={attendeeId}
      showDateFilter={false}
    />
  );
};

export default PastEvents;
