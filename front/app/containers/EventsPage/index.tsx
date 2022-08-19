import React from 'react';

// components
import EventsPageMeta from './EventsPageMeta';
import SectionContainer from 'components/SectionContainer';
import ContentContainer from 'components/ContentContainer';
import CurrentAndUpcomingEvents from './CurrentAndUpcomingEvents';
import PastEvents from './PastEvents';
import { Box } from '@citizenlab/cl2-component-library';

// styling
import styled from 'styled-components';

const StyledContentContainer = styled(ContentContainer)`
  max-width: calc(${(props) => props.theme.maxPageWidth}px - 100px);
  margin-left: auto;
  margin-right: auto;
`;

export default () => (
  <>
    <EventsPageMeta />

    <Box as="main">
      <SectionContainer>
        <StyledContentContainer id="e2e-events-container">
          <CurrentAndUpcomingEvents />
          <PastEvents />
        </StyledContentContainer>
      </SectionContainer>
    </Box>
  </>
);
