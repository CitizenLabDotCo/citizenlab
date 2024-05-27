import React, { memo } from 'react';

import {
  defaultCardHoverStyle,
  defaultCardStyle,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IEventData } from 'api/events/types';

import clHistory from 'utils/cl-router/history';

import EventInformation from './EventInformation';

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
  titleFontSize?: number;
}

const EventCard = memo<Props>((props) => {
  const { event, className, id, ...otherProps } = props;

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
      <EventInformation event={event} {...otherProps} />
    </Container>
  );
});

export default EventCard;
