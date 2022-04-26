import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import ProjectFilter from 'containers/Admin/dashboard/components/ChartFilters/ProjectFilter';

// typings
import { IOption } from 'typings';

interface Props {
  currentProjectFilter?: string;
  onProjectFilter: (filter: IOption) => void;
}

const ChartFilters = ({ currentProjectFilter, onProjectFilter }: Props) => (
  <Box display="flex" width="100%" justifyContent="space-between">
    <ProjectFilter
      currentProjectFilter={currentProjectFilter}
      onProjectFilter={onProjectFilter}
    />
  </Box>
);

export default ChartFilters;
