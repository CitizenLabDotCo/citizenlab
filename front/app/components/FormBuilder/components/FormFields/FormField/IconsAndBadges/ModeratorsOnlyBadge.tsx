import React from 'react';

import { Box, Icon, Text, colors } from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../../messages';

const ModeratorsOnlyBadge = () => (
  <Box
    display="flex"
    alignItems="center"
    px="8px"
    py="4px"
    border={`1px solid ${colors.grey300}`}
    borderRadius="3px"
    data-cy="e2e-moderators-only-badge"
  >
    <Icon fill={colors.coolGrey600} width="14px" height="14px" name="eye-off" />
    <Text
      color="coolGrey600"
      py="0px"
      my="0px"
      ml="4px"
      fontSize="xs"
      fontWeight="bold"
      whiteSpace="nowrap"
      style={{ textTransform: 'uppercase' }}
    >
      <FormattedMessage {...messages.moderatorsOnly} />
    </Text>
  </Box>
);

export default ModeratorsOnlyBadge;
