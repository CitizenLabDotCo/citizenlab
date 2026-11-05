import React from 'react';

import {
  colors,
  stylingConsts,
  Box,
  Text,
  Icon,
} from '@citizenlab/cl2-component-library';

import participantsMessages from 'components/admin/GraphCards/ParticipantsCard/messages';

import { useIntl } from 'utils/cl-intl';

import { AccessibilityInputs } from '../_shared/AccessibilityInputs';
import {
  ComparisonToggle,
  HideStatisticsToggle,
} from '../_shared/StatisticToggles';
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
          {formatMessage(participantsMessages.cardTitleTooltipMessage)}
        </Text>
      </Box>
      <TimeSeriesWidgetSettings resetComparePeriod />
      <ComparisonToggle />
      <HideStatisticsToggle />
      <AccessibilityInputs />
    </Box>
  );
};

export default ChartWidgetSettings;
