import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import TimeControl from './TimeControl';
import ProjectFilter from 'containers/Admin/dashboard/components/ChartFilters/ProjectFilter';
import GroupFilter from 'containers/Admin/dashboard/components/ChartFilters/GroupFilter';

// typings
import { IOption } from 'typings';

interface Props {
  currentProjectFilter?: string;
  currentGroupFilter?: string;
  onProjectFilter: (filter: IOption) => void;
  onGroupFilter: (filter: IOption) => void;
}

const ChartFilters = ({
  currentProjectFilter,
  currentGroupFilter,
  onProjectFilter,
  onGroupFilter,
}: Props) => {
  return (
    <Box display="flex" width="100%" justifyContent="space-between">
      <TimeControl />
      <ProjectFilter
        currentProjectFilter={currentProjectFilter}
        onProjectFilter={onProjectFilter}
      />
      <GroupFilter
        currentGroupFilter={currentGroupFilter}
        onGroupFilter={onGroupFilter}
      />
    </Box>
  );
};

export default ChartFilters;
