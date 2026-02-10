import React from 'react';

import { Title, useBreakpoint } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useEventsByUserId from 'api/events/useEventsByUserId';
import useUserBySlug from 'api/users/useUserBySlug';

import CurrentAndUpcomingEvents from 'containers/EventsPage/CurrentAndUpcomingEvents';
import PastEvents from 'containers/EventsPage/PastEvents';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage } from 'utils/cl-intl';
import { useParams } from 'utils/router';

import messages from './messages';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin: auto;
  max-width: 1200px;
`;

export const UserEvents = () => {
  const { userSlug } = useParams({ from: '/$locale/profile/$userSlug' });
  const { data: user } = useUserBySlug(userSlug);
  const { data: events } = useEventsByUserId(user?.data.id);
  const isPhoneOrSmaller = useBreakpoint('phone');
  const eventsCount = events?.data.length;

  return (
    <Container className="e2e-profile-events" id="tab-events">
      {isPhoneOrSmaller && (
        <Title mt="0px" variant="h3" as="h1">
          <FormattedMessage
            {...messages.eventsWithCount}
            values={{ eventsCount }}
          />
        </Title>
      )}

      <ScreenReaderOnly>
        <FormattedMessage
          tagName="h2"
          {...messages.invisibleTitleUserComments}
        />
      </ScreenReaderOnly>
      <CurrentAndUpcomingEvents attendeeId={user?.data.id} />
      <PastEvents attendeeId={user?.data.id} />
    </Container>
  );
};

export default UserEvents;
