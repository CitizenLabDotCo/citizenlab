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
    mb="16px"
  >
    <Text variant="boSection" fontSize="xs" m="0">
      {title}
    </Text>
    {meta && (
      <Text variant="boSection" fontSize="xs" color="coolGrey600" m="0">
        {meta}
      </Text>
    )}
  </Box>
);

export default PanelHeading;
