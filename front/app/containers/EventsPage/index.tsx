import React from 'react';

// components
import EventsPageMeta from './EventsPageMeta';
import SectionContainer from 'components/SectionContainer';
import CurrentAndUpcomingEvents from './CurrentAndUpcomingEvents';
import PastEvents from './PastEvents';
import { Box } from '@citizenlab/cl2-component-library';

const EventsPage = () => (
  <>
    <EventsPageMeta />
    <Box as="main">
      <SectionContainer>
        <Box id="e2e-events-container" mx="auto" maxWidth="1100px">
          <CurrentAndUpcomingEvents />
          <PastEvents />
        </Box>
      </SectionContainer>
    </Box>
  </>
);

export default EventsPage;
