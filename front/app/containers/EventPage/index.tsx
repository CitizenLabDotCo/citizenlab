import React from 'react';

// components
import ContentContainer from 'components/ContentContainer';
import { Helmet } from 'react-helmet';
import EventViewer from './EventViewer';

// styling
import styled from 'styled-components';

const StyledContentContainer = styled(ContentContainer)`
  max-width: calc(${(props) => props.theme.maxPageWidth}px - 100px);
  margin-left: auto;
  margin-right: auto;
`;

const EventPage = () => {
  return (
    <>
      <Helmet>
        <title>Events</title>
      </Helmet>

      <StyledContentContainer>
        <EventViewer title="Upcoming events" />
        <EventViewer title="Past events" />
      </StyledContentContainer>
    </>
  );
};

export default EventPage;
