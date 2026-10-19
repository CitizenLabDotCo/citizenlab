import React from 'react';

import { Text } from '@citizenlab/cl2-component-library';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  message?: MessageDescriptor;
}

const EmptyLevel = ({ message = messages.nothingHereYet }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Text color="textSecondary" fontSize="s">
      {formatMessage(message)}
    </Text>
  );
};

export default EmptyLevel;
