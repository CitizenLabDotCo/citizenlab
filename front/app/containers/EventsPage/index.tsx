import React from 'react';

import { Box, Title, useBreakpoint } from '@citizenlab/cl2-component-library';

import ContentContainer from 'components/ContentContainer';

import { useIntl } from 'utils/cl-intl';

import CurrentAndUpcomingEvents from './CurrentAndUpcomingEvents';
import EventsPageMeta from './EventsPageMeta';
import messages from './messages';
import PastEvents from './PastEvents';

const EventsPage = () => {
  const { formatMessage } = useIntl();
  const isTabletOrSmaller = useBreakpoint('tablet');

  return (
    <>
      <EventsPageMeta />
      <>
        <Box
          as="main"
          id="e2e-events-container"
          pb={isTabletOrSmaller ? '80px' : '160px'}
        >
          <ContentContainer mode="page">
            <Title
              color="tenantPrimary"
              style={{ fontSize: isTabletOrSmaller ? '40px' : '80px' }}
            >
              {formatMessage(messages.events)}
            </Title>
            <CurrentAndUpcomingEvents />
            <PastEvents />
          </ContentContainer>
        </Box>
      </>
    </>
  );
};

export default EventsPage;
