import React from 'react';

// components
import ContentContainer from 'components/ContentContainer';
import SectionContainer from 'components/SectionContainer';
import { Helmet } from 'react-helmet';
import EventViewer from './EventViewer';

// styling
import styled from 'styled-components';

const StyledContentContainer = styled(ContentContainer)`
  max-width: calc(${(props) => props.theme.maxPageWidth}px - 100px);
  margin-left: auto;
  margin-right: auto;
`;

const MarginAdder = styled.div`
  margin-top: 60px;
`;

const EventPage = () => {
  const upcomingEvents = [];
  const pastEvents = Array(10)
    .fill(0)
    .map((_, i) => i + 1);

  return (
    <>
      <Helmet>
        <title>Events</title>
      </Helmet>

      <SectionContainer>
        <StyledContentContainer>
          <EventViewer title="Upcoming events" events={upcomingEvents} />

          <MarginAdder>
            <EventViewer title="Past events" events={pastEvents} />
          </MarginAdder>
        </StyledContentContainer>
      </SectionContainer>
    </>
  );
};

export default EventPage;
