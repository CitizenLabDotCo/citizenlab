import React from 'react';

import { Box, Icon, Text, colors } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

// Shown in the settings of the locked header widgets (Project image, Title) to
// explain why they can't be moved or removed.
const LockedHeaderNote = () => {
  const { formatMessage } = useIntl();

  return (
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
        {formatMessage(messages.lockedHeaderNote)}
      </Text>
    </Box>
  );
};

export default LockedHeaderNote;
