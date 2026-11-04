import React from 'react';

import { Box, BoxLike, colors } from '@citizenlab/cl2-component-library';

import { adminPhaseLink } from 'containers/Admin/projects/routes';

import Tabs from './Tabs';

const padding: BoxLike = { p: '8px' };

const Phase = () => (
  <Box p={padding.p} mb="16px">
    <Tabs link={adminPhaseLink('a', 'b')} color={colors.black} />
  </Box>
);

export default Phase;
