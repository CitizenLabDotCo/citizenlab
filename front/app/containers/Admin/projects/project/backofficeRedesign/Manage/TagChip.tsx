import React, { ReactNode } from 'react';

import {
  Box,
  colors,
  stylingConsts,
  Text,
} from '@citizenlab/cl2-component-library';

interface Props {
  children: ReactNode;
  dashed?: boolean;
  action?: ReactNode;
}

const TagChip = ({ children, dashed = false, action }: Props) => (
  <Box
    as="span"
    display="inline-flex"
    alignItems="center"
    gap="4px"
    px="8px"
    py="3px"
    borderRadius={stylingConsts.borderRadius}
    border={`1px ${dashed ? 'dashed' : 'solid'} ${colors.grey300}`}
    bgColor={dashed ? colors.white : colors.grey100}
  >
    <Text
      as="span"
      m="0"
      fontSize="xs"
      fontWeight="semi-bold"
      color={dashed ? 'textSecondary' : 'textPrimary'}
    >
      {children}
    </Text>
    {action}
  </Box>
);

export default TagChip;
