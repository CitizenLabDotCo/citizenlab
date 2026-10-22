import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import { adminPhaseLink } from 'containers/Admin/projects/routes';

import Tabs from './Tabs';

const Phase = () => (
  <Box p="8px" mb="16px">
    <Tabs link={adminPhaseLink('a', 'b')} color={colors.black} />
  </Box>
);

export default Phase;
