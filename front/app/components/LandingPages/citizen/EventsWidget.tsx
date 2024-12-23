import React from 'react';

import {
  colors,
  fontSizes,
  media,
  isRtl,
  Box,
  Title,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import { darken } from 'polished';
import styled from 'styled-components';

import useEvents from 'api/events/useEvents';

import EventsMessage from 'containers/EventsPage/EventsViewer/EventsMessage';
import EventsSpinner from 'containers/EventsPage/EventsViewer/EventsSpinner';
import eventsPageMessages from 'containers/EventsPage/messages';

import EventCards from 'components/EventCards';

import { useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { isNilOrError, isNil, isError } from 'utils/helperUtils';

import messages from './messages';

const NoEventsText = styled.div`
  margin: auto 0px;
  text-align: center;
  color: ${colors.textSecondary};
  font-size: ${fontSizes.xl}px;
`;

const Header = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;

  ${isRtl`
    flex-direction: row-reverse;
  `}
`;

const StyledTitle = styled(Title)`
  ${media.phone`
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
  const isSmallerThanPhone = useBreakpoint('phone');

  const eventsLoading = isNil(events);
  const eventsError = isError(events);

  return (
    <Box display="flex" flexDirection="column">
      <Header>
        <StyledTitle variant="h2" color="tenantText" m="0">
          {formatMessage(messages.upcomingEventsWidgetTitle)}
        </StyledTitle>
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
              <Box
                display="flex"
                alignItems="center"
                justifyContent={isSmallerThanPhone ? 'center' : 'flex-start'}
              >
                <NoEventsText>
                  {formatMessage(eventsPageMessages.noUpcomingOrOngoingEvents)}
                </NoEventsText>
              </Box>
            )}

            <EventCards events={events} />
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
