import React from 'react';

import { useIntl } from 'utils/cl-intl';

import { DraftEvent } from '../draft';
import messages from '../messages';

import DraftSection from './DraftSection';
import EventItem from './EventItem';

type Props = {
  events: DraftEvent[];
  conversationId?: string;
};

const Events = ({ events, conversationId }: Props) => {
  const { formatMessage } = useIntl();

  if (events.length === 0) return null;

  return (
    <DraftSection title={formatMessage(messages.events)}>
      {events.map((event) => (
        <EventItem
          key={event.key}
          event={event}
          conversationId={conversationId}
        />
      ))}
    </DraftSection>
  );
};

export default Events;
