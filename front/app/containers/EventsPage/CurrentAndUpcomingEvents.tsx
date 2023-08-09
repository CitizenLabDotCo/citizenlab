import React from 'react';
import EventsViewer from './EventsViewer';
import styled from 'styled-components';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import messages from './messages';

const StyledEventsViewer = styled(EventsViewer)`
  margin-bottom: 135px;
`;

type Props = {
  attendeeId?: string;
};
const CurrentAndUpcomingEvents = ({
  intl: { formatMessage },
  attendeeId,
}: Props & WrappedComponentProps) => (
  <StyledEventsViewer
    showProjectFilter={true}
    title={formatMessage(messages.upcomingAndOngoingEvents)}
    fallbackMessage={messages.noUpcomingOrOngoingEvents}
    eventsTime="currentAndFuture"
    projectPublicationStatuses={['published']}
    attendeeId={attendeeId}
  />
);

export default injectIntl(CurrentAndUpcomingEvents);
