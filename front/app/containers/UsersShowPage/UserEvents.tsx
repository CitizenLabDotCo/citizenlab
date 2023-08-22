import React from 'react';

// components
import PastEvents from 'containers/EventsPage/PastEvents';
import CurrentAndUpcomingEvents from 'containers/EventsPage/CurrentAndUpcomingEvents';
import { Title, useBreakpoint } from '@citizenlab/cl2-component-library';

// style
import styled from 'styled-components';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// hooks
import useEventsByUserId from 'api/events/useEventsByUserId';

// utils
import { ScreenReaderOnly } from 'utils/a11y';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin: auto;

  max-width: 1200px;
`;

interface Props {
  userId: string;
}

export const UserEvents = ({ userId }: Props) => {
  const { data: events } = useEventsByUserId(userId);
  const isMobileOrSmaller = useBreakpoint('phone');
  const eventsCount = events?.data.length;

  return (
    <Container className="e2e-profile-events">
      {isMobileOrSmaller && (
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
      <CurrentAndUpcomingEvents attendeeId={userId} />
      <PastEvents attendeeId={userId} />
    </Container>
  );
};

export default UserEvents;
