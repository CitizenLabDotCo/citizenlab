import React, { memo } from 'react';
import moment from 'moment';

// components
import EventInformation from './EventInformation';

// types
import { IEventData } from 'api/events/types';

// style
import styled from 'styled-components';
import { defaultCardHoverStyle, defaultCardStyle } from 'utils/styleUtils';

// utils
import { getIsoDate } from 'utils/dateUtils';
import { isNilOrError } from 'utils/helperUtils';
import clHistory from 'utils/cl-router/history';

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
    const startAtMoment = moment(event.attributes.start_at);
    const endAtMoment = moment(event.attributes.end_at);
    const startAtIsoDate = getIsoDate(event.attributes.start_at);
    const endAtIsoDate = getIsoDate(event.attributes.end_at);
    const isMultiDayEvent = startAtIsoDate !== endAtIsoDate;

    const navigateToEventPage = () => {
      clHistory.push(`/events/${event.id}`);
    };

    return (
      <Container
        className={className || ''}
        id={id}
        role="button"
        onClick={navigateToEventPage}
      >
        <EventInformation
          event={event}
          startAtMoment={startAtMoment}
          endAtMoment={endAtMoment}
          isMultiDayEvent={isMultiDayEvent}
          {...otherProps}
        />
      </Container>
    );
  }

  return null;
});

export default EventCard;
