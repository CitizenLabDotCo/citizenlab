import React from 'react';

import { DateRangeInput } from '../_shared/ChartWidgetSettings';
import { ProjectPublicationStatus } from '../_shared/ProjectPublicationStatus';
import { ComparisonToggle } from '../_shared/StatisticToggles';

const ChartWidgetSettings = () => {
  return (
    <>
      <DateRangeInput resetComparePeriod />
      <ProjectPublicationStatus />
      <ComparisonToggle />
    </>
  );
};

export default ChartWidgetSettings;
