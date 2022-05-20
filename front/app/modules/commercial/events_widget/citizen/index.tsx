import React from 'react';

// components
import TopBar from './TopBar';
import EventCard from 'components/EventCard';
import EventsMessage from 'containers/EventsPage/EventsViewer/EventsMessage';
import EventsSpinner from 'containers/EventsPage/EventsViewer/EventsSpinner';
import VerticalCenterer from 'components/VerticalCenterer';

// hooks
import useEvents from 'hooks/useEvents';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// styling
import styled from 'styled-components';
import { colors, fontSizes, media } from 'utils/styleUtils';

// other
import { isNilOrError, isNil, isError } from 'utils/helperUtils';
import messages from 'containers/EventsPage/messages';

const EventsWidgetContainer = styled.div`
  padding: 48px 0 124px 0;
`;

const NoEventsText = styled.div`
  margin: auto 0px;
  text-align: center;
  color: ${colors.label};
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

  ${media.smallerThanMaxTablet`
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

export default injectIntl<InjectedIntlProps>(({ intl }) => {
  const { events } = useEvents({
    projectPublicationStatuses: ['published'],
    futureOnly: true,
    pageSize: 3,
    sort: 'oldest',
  });

  const eventsLoading = isNil(events);
  const eventsError = isError(events);

  return (
    <EventsWidgetContainer>
      <TopBar />

      {eventsLoading && <EventsSpinner />}
      {eventsError && (
        <EventsMessage message={messages.errorWhenFetchingEvents} />
      )}

      {!isNilOrError(events) && events.length === 0 && (
        <VerticalCenterer>
          <NoEventsText>
            {intl.formatMessage(messages.noUpcomingEvents)}
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
