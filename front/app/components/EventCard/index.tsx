import React, { memo } from 'react';

import {
  defaultCardHoverStyle,
  defaultCardStyle,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IEventData } from 'api/events/types';

import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';

import EventInformation from './EventInformation';

const Container = styled.div<{ clickable?: boolean }>`
  ${defaultCardStyle};
  padding: 16px;
  display: flex;
  box-shadow: none;
  border: solid 1px #ccc;
  border-radius: 6px;

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

  if (!isNilOrError(event)) {
    const navigateToEventPage = () => {
      clHistory.push(`/events/${event.id}`, { scrollToTop: true });
    };

    return (
      <Container
        className={className || ''}
        id={id}
        role="button"
        onClick={navigateToEventPage}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            navigateToEventPage();
          }
        }}
        tabIndex={0}
      >
        <EventInformation event={event} {...otherProps} />
      </Container>
    );
  }

  return null;
});

export default EventCard;
