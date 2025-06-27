import React, { memo } from 'react';

import {
  defaultCardHoverStyle,
  defaultCardStyle,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useEventImage from 'api/event_images/useEventImage';
import { IEventData } from 'api/events/types';

import useLocalize from 'hooks/useLocalize';

import Image from 'components/UI/Image';

import clHistory from 'utils/cl-router/history';

import EventInformation from './EventInformation';

/*
  Ideally the li is not part of this component, but we rather wrap EventCard where it's used in a list.
  Then the ul/li logic for accessible cards is in one place.
  It also allows this component to be used in other contexts.
*/
const Container = styled.li`
  ${defaultCardStyle};
  display: flex;
  flex-direction: column;
  box-shadow: none;
  border: solid 1px #ccc;
  border-radius: 6px;
  overflow: hidden; // Ensures image and inner content respect border radius
  position: relative;

  &:hover {
    ${defaultCardHoverStyle};
    transform: translate(0px, -1px);
    cursor: pointer;
  }
`;

const AspectRatioBox = styled.div`
  position: relative;
  width: 100%;
  padding-top: 33.33%; /* Enforces 3:1 aspect ratio */
  overflow: hidden;
`;

const EventCardImage = styled(Image)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

interface Props {
  event: IEventData;
  className?: string;
  id?: string;
}

const EventCard = memo<Props>(({ event, className, id }) => {
  const localize = useLocalize();

  const { data: eventImage } = useEventImage(event);
  const mediumImage = eventImage?.data.attributes.versions.medium;
  const eventImageAltText = localize(
    eventImage?.data.attributes.alt_text_multiloc
  );

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
      {mediumImage && (
        <AspectRatioBox>
          <EventCardImage
            src={mediumImage}
            alt={eventImageAltText}
            cover={true}
          />
        </AspectRatioBox>
      )}

      <EventInformation event={event} />
    </Container>
  );
});

export default EventCard;
