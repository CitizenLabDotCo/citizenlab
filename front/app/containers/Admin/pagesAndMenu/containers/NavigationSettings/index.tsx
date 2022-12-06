import React from 'react';
import { Box } from '@citizenlab/cl2-component-library';
import HiddenNavbarItemList from './HiddenNavbarItemList';
// components
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
