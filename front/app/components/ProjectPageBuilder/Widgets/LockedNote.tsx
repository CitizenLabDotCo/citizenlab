import React from 'react';

import { Box, Icon, Text, colors } from '@citizenlab/cl2-component-library';
import { MessageDescriptor } from 'react-intl';

import { FormattedMessage } from 'utils/cl-intl';

const LockedNote = ({ message }: { message: MessageDescriptor }) => (
  <Box
    display="flex"
    gap="8px"
    p="12px"
    background={colors.grey100}
    borderRadius="3px"
  >
    <Box flex="0 0 auto">
      <Icon
        name="lock"
        width="16px"
        height="16px"
        fill={colors.textSecondary}
      />
    </Box>
    <Text m="0px" color="textSecondary" fontSize="s">
      <FormattedMessage {...message} />
    </Text>
  </Box>
);

export default LockedNote;
