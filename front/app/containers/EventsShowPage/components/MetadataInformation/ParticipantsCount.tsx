import React from 'react';

import { Text } from '@citizenlab/cl2-component-library';

import { IEventData } from 'api/events/types';

import useRegistrantCountMessage from 'components/EventCards/EventInformation/useRegistrantCountMessage';

import { Container, Content, StyledIcon } from './MetadataInformationStyles';

export interface Props {
  event: IEventData;
}

const ParticipantsCount = ({ event }: Props) => {
  const registrantCountMessage = useRegistrantCountMessage(event);
  const attendeesCount = event.attributes.attendees_count;

  if (attendeesCount > 0) {
    return (
      <Container>
        <StyledIcon name="user" ariaHidden />
        <Content>
          <Text
            id="e2e-participants-count"
            my="4px"
            color="coolGrey600"
            fontSize="s"
          >
            {registrantCountMessage}
          </Text>
        </Content>
      </Container>
    );
  }

  return null;
};

export default ParticipantsCount;
