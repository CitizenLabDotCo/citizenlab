import React, { ReactNode } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

type Props = {
  title: string;
  children: ReactNode;
};

const DetailSection = ({ title, children }: Props) => (
  <Box pt="12px">
    <Text m="0px" mb="4px" fontSize="s" fontWeight="semi-bold">
      {title}
    </Text>
    {children}
  </Box>
);

export default DetailSection;
