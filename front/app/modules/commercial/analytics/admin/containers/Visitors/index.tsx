import React, { useState } from 'react';
import moment, { Moment } from 'moment';

// components
import { Box } from '@citizenlab/cl2-component-library';
import ChartFilters from 'containers/Admin/dashboard/overview/ChartFilters';

// typings
import { IResolution } from 'components/admin/ResolutionControl';

const Visitors = () => {
  const [startAtMoment, setStartAtMoment] = useState<Moment | null | undefined>();
  const [endAtMoment, setEndAtMoment] = useState<Moment | null>(moment());
  const [projectFilter, setProjectFilter] = useState<string | undefined>();
  const [resolution, setResolution] = useState<IResolution>('month');

  return (
    <Box width="100%">
      <ChartFilters 
        startAtMoment={startAtMoment}
        endAtMoment={endAtMoment}
        currentProjectFilter={projectFilter}
        resolution={resolution}
        onProjectFilter={setProjectFilter}
        onChangeResolution={setResolution}
      />
    </Box>
  )
};

export default Visitors;
