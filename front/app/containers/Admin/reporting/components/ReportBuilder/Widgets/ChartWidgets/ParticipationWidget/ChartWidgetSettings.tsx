import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';

import {
  ComparisonToggle,
  HideStatisticsToggle,
} from '../_shared/StatisticToggles';
import TimeSeriesWidgetSettings from '../_shared/TimeSeriesWidgetSettings';

const ChartWidgetSettings = () => {
  const {
    actions: { setProp },
  } = useNode();

  return (
    <Box>
      <TimeSeriesWidgetSettings
        onChangeDateRange={({ startDate, endDate }) => {
          if (!startDate || !endDate) {
            // Make sure that we always reset compared date range
            // if the main date range is not fully set
            setProp((props) => {
              props.compareStartAt = undefined;
              props.compareEndAt = undefined;
            });
          }
        }}
      />
      <ComparisonToggle />
      <HideStatisticsToggle />
    </Box>
  );
};

export default ChartWidgetSettings;
