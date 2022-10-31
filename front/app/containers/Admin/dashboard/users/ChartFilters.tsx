import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import ProjectFilter from '../components/filters/ProjectFilter';
import GroupFilter from '../components/filters/GroupFilter';
import TopicFilter from '../components/filters/TopicFilter';

// typings
import { IOption } from 'typings';

interface Props {
  currentProjectFilter?: string;
  currentGroupFilter?: string;
  currentTopicFilter?: string;
  onProjectFilter?: (filter: IOption) => void;
  onGroupFilter?: (filter: IOption) => void;
  onTopicFilter?: (filter: IOption) => void;
}

const ChartFilters = ({
  currentProjectFilter,
  currentGroupFilter,
  currentTopicFilter,
  onProjectFilter,
  onGroupFilter,
  onTopicFilter,
}: Props) => {
  return (
    <Box display="flex" width="100%" justifyContent="space-between">
      {onProjectFilter && (
        <ProjectFilter
          currentProjectFilter={currentProjectFilter}
          onProjectFilter={onProjectFilter}
        />
      )}

      {onGroupFilter && (
        <GroupFilter
          currentGroupFilter={currentGroupFilter}
          onGroupFilter={onGroupFilter}
        />
      )}

      {onTopicFilter && (
        <TopicFilter
          currentTopicFilter={currentTopicFilter}
          onTopicFilter={onTopicFilter}
        />
      )}
    </Box>
  );
};

export default ChartFilters;
