import React from 'react';

import { Box, Icon, colors } from '@citizenlab/cl2-component-library';

const ImagePlaceholder = () => (
  <Box
    display="flex"
    alignItems="center"
    justifyContent="center"
    flex="1"
    background={colors.grey300}
  >
    <Icon name="building" width="80px" height="80px" fill={colors.white} />
  </Box>
);

export default ImagePlaceholder;
