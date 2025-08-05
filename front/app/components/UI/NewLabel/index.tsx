import React from 'react';

import {
  Box,
  BoxMarginProps,
  colors,
  stylingConsts,
  fontSizes,
} from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const NewLabel = (props: BoxMarginProps) => {
  const { formatMessage } = useIntl();

  return (
    <Box
      as="span"
      bgColor={colors.teal100}
      color={colors.primary}
      border={`1px solid ${colors.primary}`}
      px="4px"
      height="20px"
      display="flex"
      alignItems="center"
      borderRadius={stylingConsts.borderRadius}
      style={{
        fontSize: `${fontSizes.xs}px`,
        lineHeight: `${fontSizes.xs}px`,
      }}
      {...props}
    >
      {formatMessage(messages.new)}
    </Box>
  );
};

export default NewLabel;
