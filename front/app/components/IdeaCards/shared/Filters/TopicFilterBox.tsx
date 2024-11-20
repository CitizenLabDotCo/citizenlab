import React, { memo } from 'react';

import { omit } from 'lodash-es';

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

    // Remove topics from selected idea filters so we get counts that aren't impacted by the selected topics.
    // Otherwise the counts change each time a topic is selected/deselected which isn't expected behaviour.
    const ideaFiltersWithoutTopics = omit(selectedIdeaFilters, 'topics');

    const { data: ideasFilterCounts } = useIdeasFilterCounts({
      ...ideaFiltersWithoutTopics,
      idea_status: ideaFiltersWithoutTopics.idea_status,
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
