import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import Text from 'component-library/components/Text';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

const ColorKey = () => {
  const { formatMessage } = useIntl();

  return (
    <Box display="flex" alignItems="center" gap="16px" mb="16px">
      <Box display="flex" alignItems="center" gap="4px">
        <Box
          width="12px"
          height="12px"
          borderRadius="2px"
          bg={colors.green500}
        />
        <Text fontSize="s" color="grey700" my="0px">
          {formatMessage(messages.agreeLabel)}
        </Text>
      </Box>
      <Box display="flex" alignItems="center" gap="4px">
        <Box
          width="12px"
          height="12px"
          borderRadius="2px"
          bg={colors.coolGrey500}
        />
        <Text fontSize="s" color="grey700" my="0px">
          {formatMessage(messages.unsureLabel)}
        </Text>
      </Box>
      <Box display="flex" alignItems="center" gap="4px">
        <Box width="12px" height="12px" borderRadius="2px" bg={colors.red500} />
        <Text fontSize="s" color="grey700" my="0px">
          {formatMessage(messages.disagreeLabel)}
        </Text>
      </Box>
    </Box>
  );
};

export default ColorKey;
