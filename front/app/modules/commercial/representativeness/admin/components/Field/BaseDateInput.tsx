import React from 'react';

// components
import { Box, Text, Icon } from '@citizenlab/cl2-component-library';

// styling
import { colors } from '@citizenlab/cl2-component-library';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

const BaseDateInput = () => (
  <Box display="flex" mt="28px" width="100%">
    <Box width="50%">
      <Text variant="bodyM" color="label">
        <Icon
          name="calendar"
          width="16px"
          height="16px"
          fill={colors.label}
          display="inline"
        />
        <FormattedMessage {...messages.baseMonth} />
      </Text>
    </Box>
    <Box width="50%"></Box>
  </Box>
);

export default BaseDateInput;
