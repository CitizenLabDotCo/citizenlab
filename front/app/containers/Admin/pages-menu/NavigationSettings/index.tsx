import React from 'react';
import { Box } from '@citizenlab/cl2-component-library';

// components
import VisibleNavbarItemList from './VisibleNavbarItemList';
import useFeatureFlag from 'hooks/useFeatureFlag';
import Outlet from 'components/Outlet';

const NavigationSettings = () => {
  const customizableNavbarEnabled = useFeatureFlag({
    name: 'customizable_navbar',
  });
  return (
    <>
      <Outlet id="app.containers.Admin.pages-menu.NavigationSettings" />
      {customizableNavbarEnabled || (
        <Box mb="44px">
          <VisibleNavbarItemList />
        </Box>
      )}
    </>
  );
};

export default NavigationSettings;
