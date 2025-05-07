import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';

import TitleMultilocInput from '../_shared/TitleMultilocInput';

import messages from './messages';

const Settings = () => {
  return (
    <Box my="20px" data-cy="e2e-areas-widget-settings">
      <Text mb="32px" color="textSecondary">
        <FormattedMessage {...messages.thisWidgetShows} />
      </Text>
      <TitleMultilocInput name="areas_title" />
    </Box>
  );
};

export default Settings;
