import React from 'react';

import { Box, Toggle } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';

import { useIntl } from 'utils/cl-intl';

import { AccessibilityInputs } from '../_shared/AccessibilityInputs';
import {
  ComparisonToggle,
  HideStatisticsToggle,
} from '../_shared/StatisticToggles';
import TimeSeriesWidgetSettings from '../_shared/TimeSeriesWidgetSettings';
import chartWidgetMessages from '../messages';

const ChartWidgetSettings = () => {
  const { formatMessage } = useIntl();
  const {
    actions: { setProp },
    showActiveStats,
  } = useNode((node) => ({
    showActiveStats: node.data.props.showActiveStats,
  }));

  return (
    <Box>
      <TimeSeriesWidgetSettings resetComparePeriod withProjectInput={false} />
      <ComparisonToggle />
      <Box mb="20px">
        <Toggle
          label={formatMessage(chartWidgetMessages.showActiveStats)}
          checked={!!showActiveStats}
          onChange={() => {
            setProp((props) => {
              props.showActiveStats = !showActiveStats;
            });
          }}
        />
      </Box>
      <HideStatisticsToggle />
      <AccessibilityInputs />
    </Box>
  );
};

export default ChartWidgetSettings;
