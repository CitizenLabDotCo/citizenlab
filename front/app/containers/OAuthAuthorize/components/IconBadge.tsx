import React from 'react';

import { Box, Icon, colors } from '@citizenlab/cl2-component-library';

const IconBadge = ({
  name,
}: {
  name: 'shield-checkered' | 'file' | 'shield-check';
}) => (
  <Box
    flexShrink={0}
    width="40px"
    height="40px"
    borderRadius="10px"
    background={colors.teal100}
    display="flex"
    alignItems="center"
    justifyContent="center"
  >
    <Icon name={name} fill={colors.teal500} width="22px" height="22px" />
  </Box>
);

export default IconBadge;
