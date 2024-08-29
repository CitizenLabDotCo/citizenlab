import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import {
  TitleInput,
  DateRangeInput,
} from '../ChartWidgets/_shared/ChartWidgetSettings';

const Settings = () => {
  return (
    <Box>
      <TitleInput />
      <DateRangeInput />
    </Box>
  );
};

export default Settings;
