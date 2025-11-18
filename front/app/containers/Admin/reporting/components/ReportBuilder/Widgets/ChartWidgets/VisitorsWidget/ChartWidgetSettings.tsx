import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { AccessibilityInputs } from '../_shared/AccessibilityInputs';
import {
  TitleInput,
  DateRangeInput,
  ProjectInput,
} from '../_shared/ChartWidgetSettings';
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
      <ProjectInput />
      <ResolutionInput />
      <ComparisonToggle />
      <HideStatisticsToggle />
      <AccessibilityInputs />
    </Box>
  );
};

export default ChartWidgetSettings;
