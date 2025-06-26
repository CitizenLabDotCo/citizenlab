import React from 'react';

import { Text } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';

import { Container, Content, StyledIcon } from './MetadataInformationStyles';

export interface Props {
  count: number;
  maximumAttendees: number | null;
}

const ParticipantsCount = ({ count, maximumAttendees }: Props) => {
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
          {count}{' '}
          {maximumAttendees
            ? `/ ${maximumAttendees} ${formatMessage(messages.registered)}`
            : formatMessage(messages.registered)}
        </Text>
      </Content>
    </Container>
  );
};

export default ParticipantsCount;
