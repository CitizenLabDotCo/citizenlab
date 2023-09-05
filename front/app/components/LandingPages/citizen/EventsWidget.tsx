import React from 'react';
import EventCard from 'components/EventCard';
import EventsMessage from 'containers/EventsPage/EventsViewer/EventsMessage';
import EventsSpinner from 'containers/EventsPage/EventsViewer/EventsSpinner';
import VerticalCenterer from 'components/VerticalCenterer';
import Link from 'utils/cl-router/Link';
import useEvents from 'api/events/useEvents';
import { useIntl } from 'utils/cl-intl';
import styled from 'styled-components';
import { colors, fontSizes, media, isRtl } from 'utils/styleUtils';
import { isNilOrError, isNil, isError } from 'utils/helperUtils';
import messages from './messages';
import eventsPageMessages from 'containers/EventsPage/messages';
import { Box } from '@citizenlab/cl2-component-library';
import { darken } from 'polished';

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

  ${media.tablet`
    flex-direction: column;
    gap: 16px;
  `}
`;

const StyledEventCard = styled(EventCard)`
  flex: 0 0 32.3%;
`;

const Header = styled.div`
  width: 100%;
  display: flex;
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

  &:hover {
    color: ${darken(0.2, colors.textSecondary)};
    text-decoration: underline;
  }
`;

interface Props {
  staticPageId?: string;
}

const EventsWidget = ({ staticPageId }: Props) => {
  const { formatMessage } = useIntl();
  const { data: events } = useEvents({
    projectPublicationStatuses: ['published'],
    currentAndFutureOnly: true,
    pageSize: 3,
    sort: '-start_at',
    ...(staticPageId && { staticPageId }),
  });

  const eventsLoading = isNil(events);
  const eventsError = isError(events);

  return (
    <Box display="flex" flexDirection="column">
      <Header>
        <Title>{formatMessage(messages.upcomingEventsWidgetTitle)}</Title>
      </Header>

      {eventsLoading ? (
        <EventsSpinner />
      ) : (
        <>
          <Box mb="32px">
            {eventsError && (
              <EventsMessage
                message={eventsPageMessages.errorWhenFetchingEvents}
              />
            )}

            {!isNilOrError(events) && events.data.length === 0 && (
              <VerticalCenterer>
                <NoEventsText>
                  {formatMessage(eventsPageMessages.noUpcomingOrOngoingEvents)}
                </NoEventsText>
              </VerticalCenterer>
            )}

            {!isNilOrError(events) && events.data.length > 0 && (
              <CardsContainer>
                {events.data.map((event) => (
                  <StyledEventCard
                    event={event}
                    key={event.id}
                    titleFontSize={18}
                  />
                ))}
              </CardsContainer>
            )}
          </Box>

          <Box alignSelf="center">
            <EventPageLink to="/events">
              {formatMessage(messages.viewAllEventsText)}
            </EventPageLink>
          </Box>
        </>
      )}
    </Box>
  );
};

export default EventsWidget;
