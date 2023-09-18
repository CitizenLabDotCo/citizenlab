import React from 'react';

// components
import EventsPageMeta from './EventsPageMeta';
import SectionContainer from 'components/SectionContainer';
import CurrentAndUpcomingEvents from './CurrentAndUpcomingEvents';
import PastEvents from './PastEvents';
import { Box, Title, useBreakpoint } from '@citizenlab/cl2-component-library';

// intl
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

const EventsPage = () => {
  const { formatMessage } = useIntl();
  const isTabletOrSmaller = useBreakpoint('tablet');

  return (
    <>
      <Box width="100vw">
        <Title
          px={'16px'}
          maxWidth="1100px"
          color="tenantPrimary"
          style={{ fontSize: isTabletOrSmaller ? '40px' : '80px' }}
          zIndex="10000"
          mx="auto"
          pt={isTabletOrSmaller ? '40px' : '0px'}
          mb="0px"
        >
          {formatMessage(messages.events)}
        </Title>
      </Box>
      <EventsPageMeta />
      <Box as="main">
        <SectionContainer>
          <Box
            id="e2e-events-container"
            mx="auto"
            px="24px"
            width="100%"
            maxWidth="1100px"
          >
            <CurrentAndUpcomingEvents />
            <PastEvents />
          </Box>
        </SectionContainer>
      </Box>
    </>
  );
};

export default EventsPage;
