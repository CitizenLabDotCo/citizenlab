import React from 'react';

import { Box, Text, useBreakpoint } from '@citizenlab/cl2-component-library';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { coreSettings } from 'api/app_configuration/utils';

import useLocalize from 'hooks/useLocalize';

import { DEFAULT_PADDING } from 'components/admin/ContentBuilder/constants';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const EmptyState = () => {
  const isSmallerThanPhone = useBreakpoint('phone');

  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data: appConfiguration } = useAppConfiguration();

  if (!appConfiguration) return null;

  return (
    <Box px={isSmallerThanPhone ? DEFAULT_PADDING : undefined}>
      <Text color="textSecondary">
        {formatMessage(messages.thereAreCurrentlyNoProjectsPlural, {
          areasTerm: localize(coreSettings(appConfiguration.data).areas_term, {
            fallback: formatMessage(messages.areas),
          }).toLowerCase(),
        })}
      </Text>
    </Box>
  );
};

export default EmptyState;
