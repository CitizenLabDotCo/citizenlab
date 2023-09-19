import React from 'react';

// components
import { Text } from '@citizenlab/cl2-component-library';
import { AddEventToCalendarButton } from 'components/AddEventToCalendarButton';

// styling
import { Container, Content, StyledIcon } from './MetadataInformationStyles';

// typings
import { IEventData } from 'api/events/types';

// utils
import { getEventDateString } from 'utils/dateUtils';

export interface Props {
  event: IEventData;
}

const FullEventTime = ({ event }: Props) => {
  const eventDateString = getEventDateString(event);

  return (
    <Container>
      <StyledIcon name="calendar" ariaHidden />
      <Content>
        <Text my="4px" color="coolGrey600" fontSize="s">
          {eventDateString}
        </Text>
        <AddEventToCalendarButton eventId={event.id} />
      </Content>
    </Container>
  );
};

export default FullEventTime;
