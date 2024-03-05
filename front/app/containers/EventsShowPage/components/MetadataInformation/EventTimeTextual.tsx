import React from 'react';

import { Text } from '@citizenlab/cl2-component-library';

import { IEventData } from 'api/events/types';

import { AddEventToCalendarButton } from 'components/AddEventToCalendarButton';

import { getEventDateString } from 'utils/dateUtils';

import { Container, Content, StyledIcon } from './MetadataInformationStyles';

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
