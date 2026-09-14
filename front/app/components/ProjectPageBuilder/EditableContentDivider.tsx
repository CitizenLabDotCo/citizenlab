import React from 'react';

import { Box, Divider, Text } from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

const EditableContentDivider = () => (
  <Box display="flex" alignItems="center" gap="12px" py="8px">
    <Box flex="1 1 0">
      <Divider m="0px" />
    </Box>
    <Text
      m="0px"
      fontSize="xs"
      fontWeight="bold"
      color="textSecondary"
      style={{
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        whiteSpace: 'nowrap',
      }}
    >
      <FormattedMessage {...messages.editableContent} />
    </Text>
    <Box flex="1 1 0">
      <Divider m="0px" />
    </Box>
  </Box>
);

export default EditableContentDivider;
