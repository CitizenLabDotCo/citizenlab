import React, { memo } from 'react';
import moment from 'moment';

// components
import DateBlocks from './DateBlocks';
import EventInformation from './EventInformation';

// services
import { IEventData } from 'services/events';

// style
import styled from 'styled-components';
import { defaultCardStyle } from 'utils/styleUtils';

// other
import { getIsoDate } from 'utils/dateUtils';
import { isNilOrError } from 'utils/helperUtils';

const Container = styled.div<{ clickable?: boolean }>`
  ${defaultCardStyle};
  width: 100%;
  padding: 30px;
  display: flex;
  box-shadow: none;
  border: solid 1px #ccc;
`;

interface Props {
  event: IEventData;
  className?: string;
  id?: string;
  showProjectTitle?: boolean;
  showLocation?: boolean;
  showDescription?: boolean;
  showAttachments?: boolean;
  titleFontSize?: number;
  onClickTitleGoToProjectAndScrollToEvent?: boolean;
}

const EventCard = memo<Props>((props) => {
  const { event, className, id, ...otherProps } = props;

  if (!isNilOrError(event)) {
    const startAtMoment = moment(event.attributes.start_at);
    const endAtMoment = moment(event.attributes.end_at);
    const startAtIsoDate = getIsoDate(event.attributes.start_at);
    const endAtIsoDate = getIsoDate(event.attributes.end_at);
    const isMultiDayEvent = startAtIsoDate !== endAtIsoDate;

    return (
      <Container className={className || ''} id={id || ''}>
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
          {...otherProps}
        />
      </Container>
    );
  }

  return null;
});

export default EventCard;
