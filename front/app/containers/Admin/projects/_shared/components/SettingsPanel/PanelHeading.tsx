import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

interface Props {
  label: string;
}

// The space above is padding so it doesn't merge with the previous card's
// margin.
const PanelHeading = ({ label }: Props) => (
  <Box display="flex" alignItems="center" minHeight="42px" pt="14px">
    <Box as="h3" m="0">
      <Text
        as="span"
        variant="boControl"
        color="coolGrey600"
        lineHeight="20px"
        m="0"
      >
        {label}
      </Text>
    </Box>
  </Box>
);

export default PanelHeading;
