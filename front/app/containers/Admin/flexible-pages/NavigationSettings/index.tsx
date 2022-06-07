import React from 'react';
import { Box } from '@citizenlab/cl2-component-library';

// components
import VisibleNavbarItemList from 'containers/Admin/flexible-pages/VisibleNavbarItemList';
import HiddenNavbarItemList from 'modules/commercial/customizable_navbar/admin/containers/NavigationSettings/HiddenNavbarItemList';
import useFeatureFlag from 'hooks/useFeatureFlag';

const NavigationSettings = () => (
  <>
    <Box mb="44px">
      <VisibleNavbarItemList />
    </Box>

    {useFeatureFlag({ name: 'customizable_navbar' }) && (
      <HiddenNavbarItemList />
    )}
  </>
);

export default NavigationSettings;
