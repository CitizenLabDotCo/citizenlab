import React, { memo } from 'react';

import { omit } from 'lodash-es';

import { IIdeasFilterCountsQueryParameters } from 'api/ideas_filter_counts/types';
import useIdeasFilterCounts from 'api/ideas_filter_counts/useIdeasFilterCounts';
import useTopics from 'api/topics/useTopics';

import TopicsFilter from 'components/FilterBoxes/TopicsFilter';

interface Props {
  ideaQueryParameters: IIdeasFilterCountsQueryParameters;
  selectedTopicIds: string[] | null | undefined;
  onChange: (arg: string[] | null) => void;
  className?: string;
}

const TopicFilterBox = memo<Props>(
  ({ selectedTopicIds, ideaQueryParameters, onChange, className }) => {
    const ideaFiltersWithoutTopics = omit(ideaQueryParameters, 'topics');

    const { data: topics } = useTopics({
      sort: '-ideas_count',
      ideas: ideaFiltersWithoutTopics,
    });

    const { data: ideasFilterCounts } = useIdeasFilterCounts({
      ...ideaFiltersWithoutTopics,
      idea_status: ideaFiltersWithoutTopics.idea_status,
    });

    if (ideasFilterCounts) {
      return (
        <TopicsFilter
          className={className}
          topics={topics?.data}
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
