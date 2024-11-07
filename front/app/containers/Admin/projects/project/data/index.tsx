import React from 'react';

import { Title, Text, Box } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import ResetParticipationData from './ResetParticipationData';

const Data = () => {
  const { formatMessage } = useIntl();
  return (
    <Box>
      <Title color="primary" fontSize="xxl">
        {formatMessage(messages.dataTitle)}
      </Title>
      <Text>{formatMessage(messages.dataDescription)}</Text>
      <Text fontWeight="bold" mb="40px">
        {formatMessage(messages.dataWarning)}
      </Text>
      <ResetParticipationData />
    </Box>
  );
};

export default Data;
