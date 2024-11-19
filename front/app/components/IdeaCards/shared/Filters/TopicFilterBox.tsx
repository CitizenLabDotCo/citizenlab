import React, { memo } from 'react';

import { IIdeasFilterCountsQueryParameters } from 'api/ideas_filter_counts/types';
import useIdeasFilterCounts from 'api/ideas_filter_counts/useIdeasFilterCounts';
import useTopics from 'api/topics/useTopics';

import TopicsFilter from 'components/FilterBoxes/TopicsFilter';

interface Props {
  selectedIdeaFilters: IIdeasFilterCountsQueryParameters;
  selectedTopicIds: string[] | null | undefined;
  onChange: (arg: string[] | null) => void;
  className?: string;
}

const TopicFilterBox = memo<Props>(
  ({ selectedTopicIds, selectedIdeaFilters, onChange, className }) => {
    const { data: topics } = useTopics();

    // remove topics from selected idea filters
    const { topics: _, ...selectedIdeaFiltersWithoutTopics } =
      selectedIdeaFilters;

    const { data: ideasFilterCounts } = useIdeasFilterCounts({
      ...selectedIdeaFiltersWithoutTopics,
      topics: undefined,
      idea_status: selectedIdeaFiltersWithoutTopics.idea_status,
    });

    if (topics && topics.data.length > 0 && ideasFilterCounts) {
      return (
        <TopicsFilter
          className={className}
          topics={topics.data}
          selectedTopicIds={selectedTopicIds}
          onChange={onChange}
          filterCounts={ideasFilterCounts.data.attributes}
        />
      );
    }

    return null;
  }
);

export default TopicFilterBox;
