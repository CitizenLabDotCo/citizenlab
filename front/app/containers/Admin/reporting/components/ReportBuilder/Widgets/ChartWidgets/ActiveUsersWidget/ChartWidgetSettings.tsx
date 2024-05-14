import React from 'react';

import {
  colors,
  stylingConsts,
  Box,
  Text,
  Icon,
} from '@citizenlab/cl2-component-library';

import activeUsersMessages from 'components/admin/GraphCards/ActiveUsersCard/messages';

import { useIntl } from 'utils/cl-intl';

import TimeSeriesWidgetSettings from '../_shared/TimeSeriesWidgetSettings';

const ChartWidgetSettings = () => {
  const { formatMessage } = useIntl();

  return (
    <Box>
      <Box
        bgColor={colors.teal100}
        borderRadius={stylingConsts.borderRadius}
        px="12px"
        mt="0px"
        role="alert"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Text variant="bodyS" color="textSecondary">
          <Icon
            name="info-outline"
            width="16px"
            height="16px"
            mr="4px"
            fill="textSecondary"
            display="inline"
          />
          {formatMessage(activeUsersMessages.cardTitleTooltipMessage)}
        </Text>
      </Box>
      <TimeSeriesWidgetSettings />
    </Box>
  );
};

export default ChartWidgetSettings;
