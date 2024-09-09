import React from 'react';

import { Box, colors, stylingConsts } from '@citizenlab/cl2-component-library';

interface Props {
  number: number;
  text: string;
}

const Block = ({ number, text }: Props) => {
  return (
    <Box
      borderRadius={stylingConsts.borderRadius}
      border={`1px solid ${colors.blue700}`}
      bgColor={colors.teal50}
      p="16px"
      w="240px"
    >
      <Box mb="8px">{`${number}.`}</Box>
      <Box>{text}</Box>
    </Box>
  );
};

export default Block;
