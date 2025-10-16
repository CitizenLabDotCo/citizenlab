import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import TitleMultilocInput from 'containers/Admin/pagesAndMenu/containers/ContentBuilder/components/Widgets/_shared/TitleMultilocInput';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

const Settings = () => {
  return (
    <Box my="20px">
      <Text mb="32px" color="textSecondary">
        <FormattedMessage {...messages.settingsDescription} />
      </Text>
      <TitleMultilocInput name="titleMultiloc" />
    </Box>
  );
};

export default Settings;
