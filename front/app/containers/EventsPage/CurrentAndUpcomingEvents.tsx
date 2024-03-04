import React from 'react';

import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';
import { WrappedComponentProps } from 'react-intl';

import { injectIntl } from 'utils/cl-intl';

import EventsViewer from './EventsViewer';
import messages from './messages';

type Props = {
  attendeeId?: string;
};
const CurrentAndUpcomingEvents = ({
  intl: { formatMessage },
  attendeeId,
}: Props & WrappedComponentProps) => {
  const isPhoneOrSmaller = useBreakpoint('phone');

  return (
    <Box id="e2e-current-and-upcoming-events">
      <Box mb={isPhoneOrSmaller ? '80px' : '135px'}>
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
