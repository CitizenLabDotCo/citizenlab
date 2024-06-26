import React, { memo } from 'react';

import {
  defaultCardHoverStyle,
  defaultCardStyle,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IEventData } from 'api/events/types';

import clHistory from 'utils/cl-router/history';

import EventInformation from './EventInformation';

/*
  Ideally the li is not part of this component, but we rather wrap EventCard where it's used in a list.
  Then the ul/li logic for accessible cards is in one place.
  It also allows this component to be used in other contexts.
*/
const Container = styled.li`
  ${defaultCardStyle};
  padding: 16px;
  display: flex;
  box-shadow: none;
  border: solid 1px #ccc;
  border-radius: 6px;
  position: relative;

  &:hover {
    ${defaultCardHoverStyle};
    transform: translate(0px, -1px);
    cursor: pointer;
  }
`;

interface Props {
  event: IEventData;
  className?: string;
  id?: string;
}

const EventCard = memo<Props>((props) => {
  const { event, className, id } = props;

  const navigateToEventPage = () => {
    clHistory.push(`/events/${event.id}`, { scrollToTop: true });
  };

  return (
    <Container
      className={className || ''}
      id={id}
      onKeyDown={(e) => {
        // We want this to trigger when the user interacts with the card itself, not its children. The buttons inside the card for example should not trigger this.
        if (e.target === e.currentTarget && e.key === 'Enter') {
          navigateToEventPage();
        }
      }}
      tabIndex={0}
    >
      <EventInformation event={event} />
    </Container>
  );
});

export default EventCard;
