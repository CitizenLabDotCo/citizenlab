import React, { useState } from 'react';
import moment, { Moment } from 'moment';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

// components
import { Box } from '@citizenlab/cl2-component-library';
import ChartFilters from 'containers/Admin/dashboard/overview/ChartFilters';
import Charts from './Charts';

// utils
import { getSensibleResolution } from 'containers/Admin/dashboard/overview/getSensibleResolution';

// typings
import { IResolution } from 'components/admin/ResolutionControl';
import { IOption } from 'typings';

const Visitors = () => {
  const [startAtMoment, setStartAtMoment] = useState<Moment | null | undefined>(
    undefined
  );
  const [endAtMoment, setEndAtMoment] = useState<Moment | null>(moment());
  const [projectId, setProjectId] = useState<string | undefined>();
  const [resolution, setResolution] = useState<IResolution>('month');

  const handleChangeTimeRange = (
    startAtMoment: Moment | null,
    endAtMoment: Moment | null
  ) => {
    const resolution = getSensibleResolution(startAtMoment, endAtMoment);
    setStartAtMoment(startAtMoment);
    setEndAtMoment(endAtMoment);
    setResolution(resolution);
  };

  const handleProjectFilter = ({ value }: IOption) => {
    setProjectId(value);
  };

  return (
    <>
      <Box width="100%">
        <ChartFilters
          startAtMoment={startAtMoment}
          endAtMoment={endAtMoment}
          currentProjectFilter={projectId}
          resolution={resolution}
          onChangeTimeRange={handleChangeTimeRange}
          onProjectFilter={handleProjectFilter}
          onChangeResolution={setResolution}
        />
      </Box>

      <Charts
        projectId={projectId}
        startAtMoment={startAtMoment}
        endAtMoment={endAtMoment}
        resolution={resolution}
      />
    </>
  );
};

const FeatureFlagWrapper = () => {
  const visitorsDashboardEnabled = useFeatureFlag({
    name: 'visitors_dashboard',
  });

  if (!visitorsDashboardEnabled) return null;

  return <Visitors />;
};

export default FeatureFlagWrapper;
