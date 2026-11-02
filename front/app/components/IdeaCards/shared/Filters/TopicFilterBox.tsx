import React, { memo } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { omit } from 'lodash-es';

import { IIdeasFilterCountsQueryParameters } from 'api/ideas_filter_counts/types';
import useIdeasFilterCounts from 'api/ideas_filter_counts/useIdeasFilterCounts';
import useInputTopics from 'api/input_topics/useInputTopics';

import TopicsFilter from 'components/FilterBoxes/TopicsFilter';

interface Props {
  projectId: string;
  ideaQueryParameters: IIdeasFilterCountsQueryParameters;
  selectedTopicIds: string[] | null | undefined;
  onChange: (arg: string[] | null) => void;
  className?: string;
}

const TopicFilterBox = memo<Props>(
  ({
    projectId,
    selectedTopicIds,
    ideaQueryParameters,
    onChange,
    className,
  }) => {
    const ideaFiltersWithoutTopics = omit(ideaQueryParameters, 'topics');

    const { data: topics } = useInputTopics(projectId, {
      sort: '-ideas_count',
      depth: 0,
    });

    const { data: ideasFilterCounts } = useIdeasFilterCounts({
      ...ideaFiltersWithoutTopics,
      idea_status: ideaFiltersWithoutTopics.idea_status,
    });

    if (!topics || topics.data.length === 0 || !ideasFilterCounts) {
      return null;
    }

    return (
      <Box mb="20px">
        <TopicsFilter
          className={className}
          topics={topics.data}
          selectedTopicIds={selectedTopicIds}
          onChange={onChange}
          filterCounts={ideasFilterCounts.data.attributes}
        />
      </Box>
    );
  }
);

export default TopicFilterBox;
