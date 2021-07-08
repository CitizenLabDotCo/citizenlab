import React, { memo } from 'react';
import moment from 'moment';
import { isNilOrError } from 'utils/helperUtils';

// components
import DateBlocks from './DateBlocks';
import EventInformation from './EventInformation';

// services
import { IEventData } from 'services/events';

// utils
import { getIsoDate } from 'utils/dateUtils';

// style
import styled from 'styled-components';
import { defaultCardStyle } from 'utils/styleUtils';

const Container = styled.div`
  width: 100%;
  padding: 30px;
  display: flex;
  ${defaultCardStyle};
  box-shadow: none;
  border: solid 1px #ccc;
`;

interface InputProps {
  event: IEventData;
  className?: string;
  showProjectTitle?: boolean;
}

interface Props extends InputProps {}

const EventCard = memo<Props>((props) => {
  const { event, className, showProjectTitle } = props;

  if (!isNilOrError(event)) {
    const startAtMoment = moment(event.attributes.start_at);
    const endAtMoment = moment(event.attributes.end_at);
    const startAtIsoDate = getIsoDate(event.attributes.start_at);
    const endAtIsoDate = getIsoDate(event.attributes.end_at);
    const isMultiDayEvent = startAtIsoDate !== endAtIsoDate;

    return (
      <Container className={className || ''}>
        <DateBlocks
          startAtMoment={startAtMoment}
          endAtMoment={endAtMoment}
          isMultiDayEvent={isMultiDayEvent}
        />

        <EventInformation
          event={event}
          startAtMoment={startAtMoment}
          endAtMoment={endAtMoment}
          isMultiDayEvent={isMultiDayEvent}
          showProjectTitle={showProjectTitle}
        />
      </Container>
    );
  }

  return null;
});

export default EventCard;
