import React from 'react';

import { Box, colors, Title } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import SettingsNavigationBar from './components/SettingsNavigationBar';
import messages from './messages';

const Settings = () => {
  const { formatMessage } = useIntl();

  return (
    <Box mt="40px" py="30px" px="40px" background={colors.white}>
      <Title color="primary" variant="h1">
        {formatMessage(messages.settings)}
      </Title>
      <SettingsNavigationBar />
    </Box>
  );
};

export default Settings;
