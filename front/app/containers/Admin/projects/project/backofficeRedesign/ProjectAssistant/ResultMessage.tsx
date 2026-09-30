import React from 'react';

import {
  Box,
  Icon,
  Text,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

type Props = {
  succeeded: boolean;
};

const ResultMessage = ({ succeeded }: Props) => (
  <Box
    display="flex"
    gap="8px"
    p="12px"
    bgColor={colors.white}
    border={`1px solid ${colors.borderLight}`}
    borderRadius={stylingConsts.borderRadius}
  >
    <Box flexShrink={0}>
      <Icon
        name={succeeded ? 'check-circle' : 'alert-circle'}
        fill={succeeded ? colors.success : colors.error}
      />
    </Box>
    <Text m="0px" color={succeeded ? 'textPrimary' : 'error'}>
      <FormattedMessage {...(succeeded ? messages.succeeded : messages.failed)} />
    </Text>
  </Box>
);

export default ResultMessage;
