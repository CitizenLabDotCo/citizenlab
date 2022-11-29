import React from 'react';
import EventCard from 'components/EventCard';
import EventsMessage from 'containers/EventsPage/EventsViewer/EventsMessage';
import EventsSpinner from 'containers/EventsPage/EventsViewer/EventsSpinner';
import VerticalCenterer from 'components/VerticalCenterer';
import Link from 'utils/cl-router/Link';
import useEvents from 'hooks/useEvents';
import { useIntl } from 'utils/cl-intl';
import styled from 'styled-components';
import { colors, fontSizes, media, isRtl } from 'utils/styleUtils';
import { isNilOrError, isNil, isError } from 'utils/helperUtils';
import messages from './messages';
import eventsPageMessages from 'containers/EventsPage/messages';

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

const Header = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding-bottom: 30px;
  border-bottom: 1px solid #d1d1d1;
  margin-bottom: 30px;

  ${media.phone`
    margin-bottom: 21px;
  `}

  ${isRtl`
    flex-direction: row-reverse;
  `}
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.colors.tenantText};
  font-size: ${fontSizes.xl}px;
  font-weight: 500;
  line-height: normal;
  padding: 0;
  margin: 0;

  ${media.phone`
    text-align: center;
    margin: 0;
  `};
`;

const EventPageLink = styled(Link)`
  color: ${colors.textSecondary};
  margin-top: auto;
`;

interface Props {
  id?: string;
  // null is reserved for the cases where you need to wait
  // for projectIds to avoid flashing of all events. If you need
  // all events, projectIds should be undefined.
  projectIds?: string[] | null;
}

const EventsWidget = ({ id, projectIds }: Props) => {
  // This avoids flashing of all events (if projectIds are undefined)
  // as well as having to do projectIds checks before rendering this component.
  // See CustomPageEvents.tsx for an example.

  const { formatMessage } = useIntl();
  const { events } = useEvents({
    projectPublicationStatuses: ['published'],
    currentAndFutureOnly: true,
    pageSize: 3,
    sort: 'oldest',
    ...(projectIds && { projectIds }),
  });

  if (projectIds === null) {
    return null;
  }

  const eventsLoading = isNil(events);
  const eventsError = isError(events);

  return (
    <EventsWidgetContainer data-testid={id}>
      <Header>
        <Title>{formatMessage(messages.upcomingEventsWidgetTitle)}</Title>
        <EventPageLink to="/events">
          {formatMessage(messages.viewAllEventsText)}
        </EventPageLink>
      </Header>

      {eventsLoading && <EventsSpinner />}
      {eventsError && (
        <EventsMessage message={eventsPageMessages.errorWhenFetchingEvents} />
      )}

      {!isNilOrError(events) && events.length === 0 && (
        <VerticalCenterer>
          <NoEventsText>
            {formatMessage(eventsPageMessages.noUpcomingOrOngoingEvents)}
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
};

export default EventsWidget;
