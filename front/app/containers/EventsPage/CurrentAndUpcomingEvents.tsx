import React from 'react';
import styled from 'styled-components';
import EventsViewer from './EventsViewer';

// i18n
import { injectIntl, WrappedComponentProps } from 'react-intl';
import messages from './messages';

const StyledEventsViewer = styled(EventsViewer)`
  margin-bottom: 135px;
`;

const CurrentAndUpcomingEvents = ({
  intl: { formatMessage },
}: WrappedComponentProps) => (
  <StyledEventsViewer
    title={formatMessage(messages.upcomingAndOngoingEvents)}
    fallbackMessage={messages.noUpcomingOrOngoingEvents}
    eventsTime="currentAndFuture"
  />
);

export default injectIntl(CurrentAndUpcomingEvents);
