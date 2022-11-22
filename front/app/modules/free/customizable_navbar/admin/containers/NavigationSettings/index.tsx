import { Box } from '@citizenlab/cl2-component-library';
import React from 'react';

// components
import HiddenNavbarItemList from './HiddenNavbarItemList';
import VisibleNavbarItemList from './VisibleNavbarItemList';

const NavigationSettings = () => (
  <>
    <Box mb="44px">
      <VisibleNavbarItemList />
    </Box>

    <HiddenNavbarItemList />
  </>
);

export default NavigationSettings;
