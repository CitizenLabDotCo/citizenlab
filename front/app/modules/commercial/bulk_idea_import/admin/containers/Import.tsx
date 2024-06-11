import React from 'react';

import { Box, Text, Title, colors } from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

const Import = () => {
  return (
    <Box background={colors.white} p="40px">
      <Title color="primary">
        <FormattedMessage {...messages.importInputs} />
      </Title>
      <Text color="primary" fontSize="base">
        <FormattedMessage {...messages.importNoLongerAvailable} />
      </Text>
    </Box>
  );
};

export default Import;
