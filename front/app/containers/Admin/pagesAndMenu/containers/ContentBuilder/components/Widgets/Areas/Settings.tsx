import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { coreSettings } from 'api/app_configuration/utils';

import useLocalize from 'hooks/useLocalize';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import TitleMultilocInput from '../_shared/TitleMultilocInput';

import messages from './messages';

const Settings = () => {
  const { data: appConfiguration } = useAppConfiguration();
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  if (!appConfiguration) return null;

  return (
    <Box my="20px">
      <Text mb="32px" color="textSecondary">
        <FormattedMessage
          {...messages.thisWidgetShows}
          values={{
            areasTerm: localize(
              coreSettings(appConfiguration.data).areas_term,
              {
                fallback: formatMessage(messages.areas),
              }
            ).toLowerCase(),
          }}
        />
      </Text>
      <TitleMultilocInput name="areas_title" />
    </Box>
  );
};

export default Settings;
