import React from 'react';

import { useNode } from '@craftjs/core';

import { DateRangeInput } from '../_shared/ChartWidgetSettings';
import { ComparisonToggle } from '../_shared/StatisticToggles';

const ChartWidgetSettings = () => {
  const { setProp } = useNode();

  return (
    <>
      <DateRangeInput
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
    </>
  );
};

export default ChartWidgetSettings;
