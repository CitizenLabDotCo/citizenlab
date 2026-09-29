import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

interface Props {
  title: string;
  meta?: string;
}

const PanelHeading = ({ title, meta }: Props) => (
  <Box
    display="flex"
    alignItems="baseline"
    justifyContent="space-between"
    gap="8px"
    mb="6px"
  >
    <Text variant="boSection" color="textSecondary">
      {title}
    </Text>
    {meta && <Text variant="boMicro">{meta}</Text>}
  </Box>
);

export default PanelHeading;
