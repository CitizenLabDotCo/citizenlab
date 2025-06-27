import React from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';

import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';

import messages from './messages';

const HEADER_MESSAGES: MessageDescriptor[] = [
  messages.ageGroup,
  messages.from,
  messages.to,
  messages.range,
];

const BinInputsHeader = () => (
  <Box
    display="flex"
    flexDirection="row"
    pb="8px"
    borderBottom={`1px solid ${colors.divider}`}
  >
    {HEADER_MESSAGES.map((message, i) => (
      <Box width="25%" key={i}>
        <Text
          mt="0px"
          mb="0px"
          variant="bodyS"
          color="primary"
          fontWeight="bold"
        >
          <FormattedMessage {...message} />
        </Text>
      </Box>
    ))}
  </Box>
);

export default BinInputsHeader;
