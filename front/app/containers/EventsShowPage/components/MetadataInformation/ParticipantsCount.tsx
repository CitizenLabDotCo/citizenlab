import React from 'react';

import { Text } from '@citizenlab/cl2-component-library';

import { IEventData } from 'api/events/types';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';

import { Container, Content, StyledIcon } from './MetadataInformationStyles';

export interface Props {
  event: IEventData;
  isPastEvent: boolean;
}

const ParticipantsCount = ({ isPastEvent, event }: Props) => {
  const { formatMessage } = useIntl();
  const attendeesCount = event.attributes.attendees_count;
  const maximumAttendees = event.attributes.maximum_attendees;

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
            {attendeesCount}{' '}
            {maximumAttendees
              ? `/ ${maximumAttendees} ${formatMessage(
                  isPastEvent ? messages.registered : messages.haveRegistered
                )}`
              : formatMessage(
                  isPastEvent ? messages.registered : messages.haveRegistered
                )}
          </Text>
        </Content>
      </Container>
    );
  }

  return null;
};

export default ParticipantsCount;
