import React from 'react';
import { Box } from '@citizenlab/cl2-component-library';

// components
import VisibleNavbarItemList from './VisibleNavbarItemList';
import HiddenNavbarItemList from './HiddenNavbarItemList';

const NavigationSettings = () => (
  <>
    <Box mb="44px">
      <VisibleNavbarItemList />
    </Box>

    <HiddenNavbarItemList />
  </>
);

export default NavigationSettings;
