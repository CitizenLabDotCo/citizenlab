import React from 'react';

import {
  Box,
  Text,
  Icon,
  stylingConsts,
  colors,
  IconNames,
} from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';

interface Props {
  iconName: IconNames;
  message: MessageDescriptor;
}

const BulletPoint = ({ iconName, message }: Props) => {
  const theme = useTheme();

  return (
    <Box display="flex" alignItems="center">
      <Box
        width="32px"
        height="32px"
        borderRadius={stylingConsts.borderRadius}
        bgColor={colors.grey200}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Icon
          width="18px"
          height="18px"
          fill={theme.colors.tenantPrimary}
          name={iconName}
        />
      </Box>
      <Text ml="8px" m="0">
        <FormattedMessage {...message} />
      </Text>
    </Box>
  );
};

export default BulletPoint;
