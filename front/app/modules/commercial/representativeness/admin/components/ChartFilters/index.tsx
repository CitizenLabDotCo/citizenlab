import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import TimeControl from 'containers/Admin/dashboard/components/TimeControl';
import ProjectFilter from 'containers/Admin/dashboard/components/ChartFilters/ProjectFilter';
import GroupFilter from 'containers/Admin/dashboard/components/ChartFilters/GroupFilter';

// typings
import { Moment } from 'moment';
import { IOption } from 'typings';

interface Props {
  startAtMoment?: Moment | null;
  endAtMoment: Moment | null;
  currentProjectFilter?: string;
  currentGroupFilter?: string;
  onChangeTimeRange: (
    startAtMoment: Moment | null,
    endAtMoment: Moment | null
  ) => void;
  onProjectFilter: (filter: IOption) => void;
  onGroupFilter: (filter: IOption) => void;
}

const ChartFilters = ({
  startAtMoment,
  endAtMoment,
  currentProjectFilter,
  currentGroupFilter,
  onChangeTimeRange,
  onProjectFilter,
  onGroupFilter,
}: Props) => (
  <Box display="flex" width="100%" justifyContent="space-between">
    <TimeControl
      startAtMoment={startAtMoment}
      endAtMoment={endAtMoment}
      onChange={onChangeTimeRange}
    />
    <ProjectFilter
      width="25%"
      currentProjectFilter={currentProjectFilter}
      onProjectFilter={onProjectFilter}
    />
    <GroupFilter
      width="25%"
      currentGroupFilter={currentGroupFilter}
      onGroupFilter={onGroupFilter}
    />
  </Box>
);

export default ChartFilters;
