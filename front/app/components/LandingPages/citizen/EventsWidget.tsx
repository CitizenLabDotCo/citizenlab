import React from 'react';

// components
import EventCard from 'components/EventCard';
import EventsMessage from 'containers/EventsPage/EventsViewer/EventsMessage';
import EventsSpinner from 'containers/EventsPage/EventsViewer/EventsSpinner';
import VerticalCenterer from 'components/VerticalCenterer';
import Link from 'utils/cl-router/Link';

// hooks
import { TEvents } from 'hooks/useEvents';

// i18n
import { useIntl } from 'utils/cl-intl';

// styling
import styled from 'styled-components';
import { colors, fontSizes, media, isRtl } from 'utils/styleUtils';

// other
import { isNilOrError, isNil, isError } from 'utils/helperUtils';
import messages from 'containers/EventsPage/messages';

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
  events: TEvents;
}

const EventsWidget = ({ id, events }: Props) => {
  const { formatMessage } = useIntl();

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
        <EventsMessage message={messages.errorWhenFetchingEvents} />
      )}

      {!isNilOrError(events) && events.length === 0 && (
        <VerticalCenterer>
          <NoEventsText>
            {formatMessage(messages.noUpcomingOrOngoingEvents)}
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
