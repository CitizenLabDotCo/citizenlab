import React, { memo, useState, useEffect } from 'react';

// components
import TopBar from './TopBar';
import { Spinner } from 'cl2-component-library';
import EventCard from 'components/EventCard';
import Pagination from 'components/Pagination';

// svg
import noEventsIllustration from './NoEventsPicture.svg';

// hooks
import useEvents from 'hooks/useEvents';

// styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// other
import { IEventData } from 'services/events';
import { sliceEventsToPage, getNumberOfPages } from './eventsViewerUtils';
import { isNilOrError } from 'utils/helperUtils';

interface IStyledEventCard {
  last: boolean;
}

const StyledSpinner = styled(Spinner)`
  margin-top: 70px;
`;

const StyledEventCard = styled(EventCard)<IStyledEventCard>`
  margin-bottom: ${({ last }) => (last ? 0 : 39)}px;
`;

const NoEventsContainer = styled.figure`
  position: relative;
  width: 100%;
  margin: 78px 0px 216px;
`;

const NoEventsIllustration = styled.img`
  width: 345px;
  height: 286px;
  display: block;
  margin: 0px auto;
`;

const NoEventsText = styled.figcaption`
  margin: 37px auto 0px;
  text-align: center;
  color: ${colors.label};
  font-size: ${fontSizes.xl}px;
`;

const StyledPagination = styled(Pagination)`
  justify-content: center;
  margin: 36px auto 0px;
`;

interface Props {
  title: string;
  fallbackMessage: string;
  eventsTime: 'past' | 'future';
  className?: string;
}

const EVENTS_PER_PAGE = 10;

const EventsViewer = memo<Props>(
  ({ title, fallbackMessage, eventsTime, className }) => {
    const [projectIds, setProjectIds] = useState<string[]>([]);

    const events = useEvents(
      projectIds,
      eventsTime === 'future',
      eventsTime === 'past'
    );

    const [currentPage, setCurrentPage] = useState<number>(1);
    const [visibleEvents, setVisibleEvents] = useState<IEventData[]>([]);
    const [eventsHaveLoaded, setEventsHaveLoaded] = useState<boolean>(false);

    useEffect(() => {
      if (isNilOrError(events)) {
        setVisibleEvents([]);
        setEventsHaveLoaded(false);
        return;
      }

      setVisibleEvents(sliceEventsToPage(events, currentPage, EVENTS_PER_PAGE));
      setEventsHaveLoaded(true);
    }, [events, currentPage]);

    return (
      <div className={className}>
        <TopBar title={title} setProjectIds={setProjectIds} />

        {!eventsHaveLoaded && <StyledSpinner />}

        {eventsHaveLoaded && (
          <>
            {visibleEvents.length > 0 &&
              visibleEvents.map((event, i) => (
                <StyledEventCard
                  event={event}
                  showProjectTitle={true}
                  last={visibleEvents.length - 1 === i}
                  key={event.id}
                />
              ))}

            {visibleEvents.length === 0 && (
              <NoEventsContainer>
                <NoEventsIllustration src={noEventsIllustration} />

                <NoEventsText>{fallbackMessage}</NoEventsText>
              </NoEventsContainer>
            )}

            {!isNilOrError(events) && events.length > 10 && (
              <StyledPagination
                currentPage={currentPage}
                totalPages={getNumberOfPages(events.length, EVENTS_PER_PAGE)}
                loadPage={setCurrentPage}
                useColorsTheme
              />
            )}
          </>
        )}
      </div>
    );
  }
);

export default EventsViewer;
