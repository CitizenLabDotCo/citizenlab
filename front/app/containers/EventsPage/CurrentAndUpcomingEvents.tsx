import React from 'react';
import EventsViewer from './EventsViewer';
import styled from 'styled-components';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import messages from './messages';
import { Box } from '@citizenlab/cl2-component-library';

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
  <Box id="e2e-current-and-upcoming-events">
    <StyledEventsViewer
      showProjectFilter={true}
      title={formatMessage(messages.upcomingAndOngoingEvents)}
      fallbackMessage={messages.noUpcomingOrOngoingEvents}
      eventsTime="currentAndFuture"
      projectPublicationStatuses={['published']}
      attendeeId={attendeeId}
    />
  </Box>
);

export default injectIntl(CurrentAndUpcomingEvents);
