import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import AnonymousToggle from './components/AnonymousToggle';
import SurveySettings from './components/SurveySettings';

const Settings = () => {
  return (
    <Box mt="40px" py="30px" px="40px" background={colors.white}>
      <SurveySettings />
      <AnonymousToggle />
    </Box>
  );
};

export default Settings;
