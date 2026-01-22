import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { AccessibilityInputs } from '../_shared/AccessibilityInputs';
import {
  ComparisonToggle,
  HideStatisticsToggle,
} from '../_shared/StatisticToggles';
import TimeSeriesWidgetSettings from '../_shared/TimeSeriesWidgetSettings';

const ChartWidgetSettings = () => {
  return (
    <Box>
      <TimeSeriesWidgetSettings resetComparePeriod withProjectInput={false} />
      <ComparisonToggle />
      <HideStatisticsToggle />
      <AccessibilityInputs />
    </Box>
  );
};

export default ChartWidgetSettings;
