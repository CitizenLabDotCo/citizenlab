import React from 'react';
import { WrappedComponentProps } from 'react-intl';
// hooks
import useEvents from 'hooks/useEvents';
// i18n
import { injectIntl } from 'utils/cl-intl';
// other
import { isNilOrError, isNil, isError } from 'utils/helperUtils';
import { colors, fontSizes, media } from 'utils/styleUtils';
import EventsMessage from 'containers/EventsPage/EventsViewer/EventsMessage';
import EventsSpinner from 'containers/EventsPage/EventsViewer/EventsSpinner';
import messages from 'containers/EventsPage/messages';
import EventCard from 'components/EventCard';
import VerticalCenterer from 'components/VerticalCenterer';
// styling
import styled from 'styled-components';
// components
import TopBar from './TopBar';

const EventsWidgetContainer = styled.div`
  padding: 48px 0 124px 0;
`;

const NoEventsText = styled.div`
  margin: auto 0px;
  text-align: center;
  color: ${colors.textSecondary};
  font-size: ${fontSizes.xl}px;
`;

const CardsContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  > * {
    margin: 0px 19px;
  }
  > :first-child {
    margin-left: 0px;
  }
  > :last-child {
    margin-right: 0px;
  }

  ${media.tablet`
    flex-direction: column;

    > * {
      margin: 19px 0px;
    }
    > :first-child {
      margin-top: 0px;
    }
    > :last-child {
      margin-bottom: 0px;
    }
  `}
`;

const StyledEventCard = styled(EventCard)`
  border-radius: 3px;
  padding: 20px;
`;

export default injectIntl<WrappedComponentProps>(({ intl }) => {
  const { events } = useEvents({
    projectPublicationStatuses: ['published'],
    currentAndFutureOnly: true,
    pageSize: 3,
    sort: 'oldest',
  });

  const eventsLoading = isNil(events);
  const eventsError = isError(events);

  return (
    <EventsWidgetContainer data-testid="e2e-events-widget-container">
      <TopBar />

      {eventsLoading && <EventsSpinner />}
      {eventsError && (
        <EventsMessage message={messages.errorWhenFetchingEvents} />
      )}

      {!isNilOrError(events) && events.length === 0 && (
        <VerticalCenterer>
          <NoEventsText>
            {intl.formatMessage(messages.noUpcomingOrOngoingEvents)}
          </NoEventsText>
        </VerticalCenterer>
      )}

      {!isNilOrError(events) && events.length > 0 && (
        <CardsContainer>
          {events.map((event) => (
            <StyledEventCard
              event={event}
              key={event.id}
              titleFontSize={18}
              showProjectTitle
              onClickTitleGoToProjectAndScrollToEvent
            />
          ))}
        </CardsContainer>
      )}
    </EventsWidgetContainer>
  );
});
