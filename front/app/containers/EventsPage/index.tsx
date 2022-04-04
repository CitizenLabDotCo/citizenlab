import React from 'react';

// components
import EventsPageMeta from './EventsPageMeta';
import SectionContainer from 'components/SectionContainer';
import ContentContainer from 'components/ContentContainer';
import UpcomingEvents from './UpcomingEvents';
import PastEvents from './PastEvents';

// styling
import styled from 'styled-components';

const Container = styled.main``;

const StyledContentContainer = styled(ContentContainer)`
  max-width: calc(${(props) => props.theme.maxPageWidth}px - 100px);
  margin-left: auto;
  margin-right: auto;
`;

export default () => (
  <>
    <EventsPageMeta />

    <Container>
      <SectionContainer>
        <StyledContentContainer>
          <UpcomingEvents />
          <PastEvents />
        </StyledContentContainer>
      </SectionContainer>
    </Container>
  </>
);
