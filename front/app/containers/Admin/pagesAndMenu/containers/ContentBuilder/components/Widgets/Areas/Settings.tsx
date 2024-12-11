import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import TitleMultilocInput from '../_shared/TitleMultilocInput';

const Settings = () => {
  return (
    <Box my="20px">
      <TitleMultilocInput name="areas_title" />
    </Box>
  );
};

export default Settings;
