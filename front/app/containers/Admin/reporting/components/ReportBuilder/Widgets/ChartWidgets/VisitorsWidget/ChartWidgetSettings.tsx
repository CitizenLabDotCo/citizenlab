import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';

import { getComparedTimeRange } from 'components/admin/GraphCards/_utils/query';

import { TitleInput, DateRangeInput } from '../_shared/ChartWidgetSettings';
import {
  ComparisonToggle,
  HideStatisticsToggle,
} from '../_shared/StatisticToggles';
import { ResolutionInput } from '../_shared/TimeSeriesWidgetSettings';

const ChartWidgetSettings = () => {
  const {
    actions: { setProp },
    compareStartAt,
    compareEndAt,
  } = useNode((node) => ({
    compareStartAt: node.data.props.compareStartAt,
    compareEndAt: node.data.props.compareEndAt,
  }));

  const comparePreviousPeriod = !!compareStartAt && !!compareEndAt;

  return (
    <Box>
      <TitleInput />
      <DateRangeInput
        onChangeDateRange={({ startDate, endDate }) => {
          if (startDate && endDate) {
            if (comparePreviousPeriod) {
              const { compare_start_at, compare_end_at } = getComparedTimeRange(
                startDate,
                endDate
              );

              setProp((props) => {
                props.compareStartAt = compare_start_at;
                props.compareEndAt = compare_end_at;
              });
            }
          } else {
            // Make sure that we always reset compared date range
            // if the main date range is not fully set
            setProp((props) => {
              props.compareStartAt = undefined;
              props.compareEndAt = undefined;
            });
          }
        }}
      />
      <ResolutionInput />
      <ComparisonToggle />
      <HideStatisticsToggle />
    </Box>
  );
};

export default ChartWidgetSettings;
