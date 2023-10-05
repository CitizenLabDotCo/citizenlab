import React from 'react';

// components
import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';
import EventsViewer from './EventsViewer';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import messages from './messages';

type Props = {
  attendeeId?: string;
};
const CurrentAndUpcomingEvents = ({
  intl: { formatMessage },
  attendeeId,
}: Props & WrappedComponentProps) => {
  const isMobileOrSmaller = useBreakpoint('phone');

  return (
    <Box id="e2e-current-and-upcoming-events">
      <Box mb={isMobileOrSmaller ? '80px' : '135px'}>
        <EventsViewer
          showProjectFilter={true}
          title={formatMessage(messages.upcomingAndOngoingEvents)}
          fallbackMessage={messages.noUpcomingOrOngoingEvents}
          eventsTime="currentAndFuture"
          projectPublicationStatuses={['published']}
          attendeeId={attendeeId}
        />
      </Box>
    </Box>
  );
};

export default injectIntl(CurrentAndUpcomingEvents);
