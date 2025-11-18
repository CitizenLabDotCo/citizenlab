import React from 'react';

import { AccessibilityInputs } from '../_shared/AccessibilityInputs';
import { DateRangeInput } from '../_shared/ChartWidgetSettings';
import { ComparisonToggle } from '../_shared/StatisticToggles';

const ChartWidgetSettings = () => {
  return (
    <>
      <DateRangeInput resetComparePeriod />
      <ComparisonToggle />
      <AccessibilityInputs />
    </>
  );
};

export default ChartWidgetSettings;
