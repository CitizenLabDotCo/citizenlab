import React from 'react';
import { Moment } from 'moment';
// typings
import { IOption } from 'typings';
// components
import { Box } from '@citizenlab/cl2-component-library';
import TimeControl from '../components/TimeControl';
import GroupFilter from '../components/filters/GroupFilter';

interface Props {
  startAtMoment?: Moment | null | undefined;
  endAtMoment: Moment | null;
  currentGroupFilter?: string;
  onChangeTimeRange: (
    startAtMoment: Moment | null,
    endAtMoment: Moment | null
  ) => void;
  onGroupFilter: (filter: IOption) => void;
}

const ChartFilters = ({
  startAtMoment,
  endAtMoment,
  currentGroupFilter,
  onGroupFilter,
  onChangeTimeRange,
}: Props) => {
  return (
    <Box width="100%" display="flex" mt="-10px">
      <TimeControl
        startAtMoment={startAtMoment}
        endAtMoment={endAtMoment}
        onChange={onChangeTimeRange}
      />
      <Box ml="12px">
        <GroupFilter
          currentGroupFilter={currentGroupFilter}
          onGroupFilter={onGroupFilter}
        />
      </Box>
    </Box>
  );
};

export default ChartFilters;
