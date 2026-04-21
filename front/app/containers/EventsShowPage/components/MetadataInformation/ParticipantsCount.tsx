import React from 'react';

import { Text } from '@citizenlab/cl2-component-library';

import { IEventData } from 'api/events/types';

import useRegistrantCountMessage from 'components/EventCards/EventInformation/useRegistrantCountMessage';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';
import { Container, Content, StyledIcon } from './MetadataInformationStyles';

export interface Props {
  event: IEventData;
}

const ParticipantsCount = ({ event }: Props) => {
  const { formatMessage } = useIntl();
  const registrantCountMessage = useRegistrantCountMessage(event);
  const attendeesCount = event.attributes.attendees_count;

  if (attendeesCount > 0) {
    return (
      <Container>
        <StyledIcon
          name="user"
          title={formatMessage(messages.registrantsIconAltText)}
          ariaHidden={false}
        />
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
