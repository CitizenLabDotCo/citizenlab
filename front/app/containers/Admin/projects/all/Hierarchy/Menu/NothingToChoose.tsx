import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

// What a flyout says when it has no choices, or none match its search.
const NothingToChoose = () => {
  const { formatMessage } = useIntl();

  return (
    <Box px="8px" py="6px">
      <Text as="span" m="0" variant="boMicro" color="coolGrey500">
        {formatMessage(messages.nothingToChoose)}
      </Text>
    </Box>
  );
};

export default NothingToChoose;
