import React from 'react';

import { Box, Icon, Text, colors } from '@citizenlab/cl2-component-library';
import { MessageDescriptor } from 'react-intl';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

type Props = {
  message?: MessageDescriptor;
};

// The "eye-off" hint that tells admins a placeholder is invisible to residents.
const AdminOnlyNote = ({ message = messages.onlyAdminsSeeThis }: Props) => (
  <Box display="flex" alignItems="center" gap="6px">
    <Icon
      name="eye-off"
      width="16px"
      height="16px"
      fill={colors.textSecondary}
    />
    <Text m="0px" color="textSecondary" fontSize="s">
      <FormattedMessage {...message} />
    </Text>
  </Box>
);

export default AdminOnlyNote;
