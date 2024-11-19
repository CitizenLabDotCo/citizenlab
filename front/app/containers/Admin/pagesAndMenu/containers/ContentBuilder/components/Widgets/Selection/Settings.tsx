import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';

import TitleMultilocInput from '../_shared/TitleMultilocInput';

import messages from './messages';

const Settings = () => {
  return (
    <Box my="20px">
      <Text mb="32px" color="textSecondary">
        <FormattedMessage {...messages.inThisWidget} formatBold />
      </Text>
      <Box mb="20px">
        <TitleMultilocInput name="selection_title" />
      </Box>
    </Box>
  );
};

export default Settings;
