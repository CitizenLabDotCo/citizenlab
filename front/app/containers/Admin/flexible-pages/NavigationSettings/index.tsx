import React from 'react';
import { Box } from '@citizenlab/cl2-component-library';

// components
import VisibleNavbarItemList from '../VisibleNavbarItemList';
import useFeatureFlag from 'hooks/useFeatureFlag';
import Outlet from 'components/Outlet';

const NavigationSettings = () => (
  <>
    <Outlet id="app.containers.Admin.pages-menu.navigation-settings" />
    {useFeatureFlag({ name: 'customizable_navbar' }) || (
      <Box mb="44px">
        <VisibleNavbarItemList />
      </Box>
    )}
  </>
);

export default NavigationSettings;
