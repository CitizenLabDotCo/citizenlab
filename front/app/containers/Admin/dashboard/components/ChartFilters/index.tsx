import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import ProjectFilter from './ProjectFilter';
import GroupFilter from './GroupFilter';
import TopicFilter from './TopicFilter';

// typings
import { IOption } from 'typings';

interface Props {
  currentProjectFilter?: string | null;
  currentGroupFilter?: string | null;
  currentTopicFilter?: string | null;
  onProjectFilter?: ((filter: IOption) => void) | null;
  onGroupFilter?: ((filter: IOption) => void) | null;
  onTopicFilter?: ((filter: IOption) => void) | null;
  onlyModerator?: boolean;
}

const ChartFilters = ({
  currentProjectFilter,
  currentGroupFilter,
  currentTopicFilter,
  onProjectFilter,
  onGroupFilter,
  onTopicFilter,
  onlyModerator,
}: Props) => {
  return (
    <Box display="flex" width="100%" justifyContent="space-between">
      {onProjectFilter && (
        <ProjectFilter
          currentProjectFilter={currentProjectFilter}
          onProjectFilter={onProjectFilter}
          onlyModerator={onlyModerator}
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
