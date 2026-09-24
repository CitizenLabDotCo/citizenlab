import React from 'react';

import { Box, colors, Icon, Text } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const RespondedBadge = () => {
  const { formatMessage } = useIntl();

  return (
    <Box as="span" display="inline-flex" alignItems="center" gap="2px">
      <Icon name="check" width="14px" height="14px" fill={colors.green700} />
      <Text
        as="span"
        m="0"
        fontSize="xs"
        fontWeight="semi-bold"
        color="green700"
      >
        {formatMessage(messages.responded)}
      </Text>
    </Box>
  );
};

export default RespondedBadge;
