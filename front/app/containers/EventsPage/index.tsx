import React from 'react';

// components
import EventsPageMeta from './EventsPageMeta';
import SectionContainer from 'components/SectionContainer';
import CurrentAndUpcomingEvents from './CurrentAndUpcomingEvents';
import PastEvents from './PastEvents';
import { Box, Title, useBreakpoint } from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

const EventsPage = () => {
  const isTabletOrSmaller = useBreakpoint('tablet');
  const theme = useTheme();

  return (
    <>
      <Box
        width="100vw"
        height={isTabletOrSmaller ? '180px' : '280px'}
        bgColor={theme.colors.tenantPrimary}
      >
        <Title
          px="24px"
          maxWidth="1100px"
          color="white"
          style={{ fontSize: isTabletOrSmaller ? '64px' : '74px' }}
          zIndex="10000"
          mx="auto"
          pt={isTabletOrSmaller ? '72px' : '156px'}
        >
          Events
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
