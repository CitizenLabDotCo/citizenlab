import React, { ReactNode } from 'react';

import {
  Box,
  colors,
  stylingConsts,
  Text,
} from '@citizenlab/cl2-component-library';

interface Props {
  title: string;
  children: ReactNode;
}

const Card = ({ title, children }: Props) => (
  <Box
    border={`1px solid ${colors.grey300}`}
    borderRadius={stylingConsts.borderRadius}
    p="16px"
  >
    <Text m="0" mb="12px" fontSize="s" fontWeight="semi-bold">
      {title}
    </Text>
    {children}
  </Box>
);

export default Card;
