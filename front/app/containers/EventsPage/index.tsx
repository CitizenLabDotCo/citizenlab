import React from 'react';
// styling
import styled from 'styled-components';
import { Box } from '@citizenlab/cl2-component-library';
import ContentContainer from 'components/ContentContainer';
import SectionContainer from 'components/SectionContainer';
import CurrentAndUpcomingEvents from './CurrentAndUpcomingEvents';
// components
import EventsPageMeta from './EventsPageMeta';
import PastEvents from './PastEvents';

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
