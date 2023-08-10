import React from 'react';

// components
import { Text } from '@citizenlab/cl2-component-library';

// styling
import { Container, Content, StyledIcon } from './MetadataInformationStyles';
import { useIntl } from 'utils/cl-intl';
import messages from '../../messages';

export interface Props {
  count: number;
}

const ParticipantsCount = ({ count }: Props) => {
  const { formatMessage } = useIntl();

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
          {formatMessage(messages.xParticipants, { count })}
        </Text>
      </Content>
    </Container>
  );
};

export default ParticipantsCount;
