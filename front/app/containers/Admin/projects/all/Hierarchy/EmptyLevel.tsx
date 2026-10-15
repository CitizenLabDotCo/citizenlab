import React from 'react';

import { Text } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const EmptyLevel = () => {
  const { formatMessage } = useIntl();

  return (
    <Text color="textSecondary" fontSize="s">
      {formatMessage(messages.nothingHereYet)}
    </Text>
  );
};

export default EmptyLevel;
