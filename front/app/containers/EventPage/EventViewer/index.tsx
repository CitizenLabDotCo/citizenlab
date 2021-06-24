import React, { memo, useState, useEffect } from 'react';

// components
import TopBar from './TopBar';
import Pagination from 'components/Pagination';

// svg
import noEventsIllustration from './NoEventsPicture.svg';

// styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// other
import { sliceEventsToPage, getNumberOfPages } from './eventViewerUtils';

const PlaceHolder = styled.div`
  width: 100%;
  height: 237px;
  margin-top: 39px;
  padding: 30px;
  font-size: 25px;
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
  title: JSX.Element;
  fallbackMessage: JSX.Element;
  events: number[];
  className?: string;
}

const EVENTS_PER_PAGE = 10;

// const EventViewer = memo<Props>(({ title, events, className }) => {
const EventViewer = memo<Props>((props) => {
  const { title, events, className, fallbackMessage } = props;

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [visibleEvents, setVisibleEvents] = useState<number[]>([]);

  useEffect(() => {
    setVisibleEvents(sliceEventsToPage(events, currentPage, EVENTS_PER_PAGE));
  }, [events, currentPage]);

  return (
    <div className={className}>
      <TopBar title={title} />

      {visibleEvents.length > 0 &&
        visibleEvents.map((e) => <PlaceHolder key={e}>{e}</PlaceHolder>)}

      {events.length === 0 && (
        <NoEventsContainer>
          <NoEventsIllustration src={noEventsIllustration} />

          <NoEventsText>{fallbackMessage}</NoEventsText>
        </NoEventsContainer>
      )}

      {events.length > 10 && (
        <StyledPagination
          currentPage={currentPage}
          totalPages={getNumberOfPages(events.length, EVENTS_PER_PAGE)}
          loadPage={setCurrentPage}
          useColorsTheme
        />
      )}
    </div>
  );
});

export default EventViewer;
