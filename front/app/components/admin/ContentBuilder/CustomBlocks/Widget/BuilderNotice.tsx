import React from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

interface Props {
  message: typeof messages.blockLoadError;
}

// Only the builder sees why a block is not rendering. On the citizen side a
// failed block leaves a hole rather than telling a reader about our internals.
const BuilderNotice = ({ message }: Props) => (
  <Box
    p="16px"
    background={colors.errorLight}
    borderRadius="3px"
    data-testid="custom-block-notice"
  >
    <Text m="0" color="error">
      <FormattedMessage {...message} />
    </Text>
  </Box>
);

export default BuilderNotice;
