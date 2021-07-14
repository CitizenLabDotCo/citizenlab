import React from 'react';

// components
import TopBar from './TopBar';

// hooks
// import useEvents from 'hooks/useEvents';

// styling
import styled from 'styled-components';

const EventsWidgetContainer = styled.div`
  padding: 48px 0 124px 0;
`;

export default () => {
  return (
    <EventsWidgetContainer>
      <TopBar />
    </EventsWidgetContainer>
  );
};
