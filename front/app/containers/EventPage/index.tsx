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

const EventViewerWithTopMargin = styled(EventViewer)`
  margin-top: 78px;
`;

const EventPage = () => {
  const upcomingEvents = Array(15)
    .fill(0)
    .map((_, i) => i + 1);

  const pastEvents = [];

  return (
    <>
      <Helmet>
        <title>Events</title>
      </Helmet>

      <SectionContainer>
        <StyledContentContainer>
          <EventViewer title="Upcoming events" events={upcomingEvents} />
          <EventViewerWithTopMargin title="Past events" events={pastEvents} />
        </StyledContentContainer>
      </SectionContainer>
    </>
  );
};

export default EventPage;
