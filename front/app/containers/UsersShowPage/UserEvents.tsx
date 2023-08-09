import React from 'react';

// components
import PastEvents from 'containers/EventsPage/PastEvents';
import CurrentAndUpcomingEvents from 'containers/EventsPage/CurrentAndUpcomingEvents';

// style
import styled from 'styled-components';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

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
  return (
    <Container className="e2e-profile-comments">
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
