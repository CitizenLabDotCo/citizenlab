import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import useAreaTerms from 'hooks/areaTerms/useAreaTerms';

import { FormattedMessage } from 'utils/cl-intl';

import TitleMultilocInput from '../_shared/TitleMultilocInput';

import messages from './messages';

const Settings = () => {
  const { areasTerm } = useAreaTerms();

  return (
    <Box my="20px" data-cy="e2e-areas-widget-settings">
      <Text mb="32px" color="textSecondary">
        <FormattedMessage
          {...messages.thisWidgetShows}
          values={{
            areasTerm,
          }}
        />
      </Text>
      <TitleMultilocInput name="areas_title" />
    </Box>
  );
};

export default Settings;
