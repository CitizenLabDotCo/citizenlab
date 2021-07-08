import React, { memo, useState, useEffect } from 'react';

// components
import TopBar from './TopBar';
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

const PlaceHolder = styled.div<{ first: boolean }>`
  width: 100%;
  height: 237px;
  margin-top: ${({ first }) => (first ? '29px' : '39px')};
  padding: 30px;
  font-size: ${fontSizes.xxl}px;
  border: 1px dotted;
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

    useEffect(() => {
      if (isNilOrError(events)) {
        setVisibleEvents([]);
        return;
      }

      setVisibleEvents(sliceEventsToPage(events, currentPage, EVENTS_PER_PAGE));
    }, [events, currentPage]);

    return (
      <div className={className}>
        <TopBar title={title} setProjectIds={setProjectIds} />

        {visibleEvents.length > 0 &&
          visibleEvents.map((event, i) => (
            <PlaceHolder key={event.id} first={i === 0}>
              {event.id}
            </PlaceHolder>
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
      </div>
    );
  }
);

export default EventsViewer;
