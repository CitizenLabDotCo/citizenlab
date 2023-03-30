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

const CurrentAndUpcomingEvents = ({
  intl: { formatMessage },
}: WrappedComponentProps) => (
  <StyledEventsViewer
    showProjectFilter={true}
    title={formatMessage(messages.upcomingAndOngoingEvents)}
    fallbackMessage={messages.noUpcomingOrOngoingEvents}
    eventsTime="currentAndFuture"
    onClickTitleGoToProjectAndScrollToEvent={true}
    projectPublicationStatuses={['published']}
  />
);

export default injectIntl(CurrentAndUpcomingEvents);
