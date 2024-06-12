import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { TitleInput, DateRangeInput } from '../_shared/ChartWidgetSettings';
import {
  ComparisonToggle,
  HideStatisticsToggle,
} from '../_shared/StatisticToggles';
import { ResolutionInput } from '../_shared/TimeSeriesWidgetSettings';

const ChartWidgetSettings = () => {
  return (
    <Box>
      <TitleInput />
      <DateRangeInput resetComparePeriod />
      <ResolutionInput />
      <ComparisonToggle />
      <HideStatisticsToggle />
    </Box>
  );
};

export default ChartWidgetSettings;
