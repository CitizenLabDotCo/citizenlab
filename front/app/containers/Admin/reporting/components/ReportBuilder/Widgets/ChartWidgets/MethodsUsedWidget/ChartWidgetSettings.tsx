import React from 'react';

import { DateRangeInput } from '../_shared/ChartWidgetSettings';
import { ComparisonToggle } from '../_shared/StatisticToggles';

const ChartWidgetSettings = () => {
  return (
    <>
      <DateRangeInput resetComparePeriod />
      <ComparisonToggle />
    </>
  );
};

export default ChartWidgetSettings;
