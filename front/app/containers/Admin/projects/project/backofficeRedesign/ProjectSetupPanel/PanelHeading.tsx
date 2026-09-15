import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

interface Props {
  title: string;
  meta: string;
}

const PanelHeading = ({ title, meta }: Props) => (
  <Box
    display="flex"
    alignItems="baseline"
    justifyContent="space-between"
    gap="8px"
    mb="6px"
  >
    <Text m="0" fontSize="s" fontWeight="bold" color="textPrimary">
      {title}
    </Text>
    <Text m="0" fontSize="xs" color="textSecondary">
      {meta}
    </Text>
  </Box>
);

export default PanelHeading;
