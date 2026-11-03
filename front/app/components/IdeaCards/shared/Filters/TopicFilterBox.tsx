import React, { memo } from 'react';

import useInputTopics from 'api/input_topics/useInputTopics';

import TopicsFilter from 'components/FilterBoxes/TopicsFilter';
import { FilterCounts } from 'components/FilterBoxes/types';

interface Props {
  projectId: string;
  filterCounts: FilterCounts;
  selectedTopicIds: string[] | null | undefined;
  onChange: (arg: string[] | null) => void;
  className?: string;
}

const TopicFilterBox = memo<Props>(
  ({ projectId, selectedTopicIds, filterCounts, onChange, className }) => {
    const { data: topics } = useInputTopics(projectId, {
      sort: '-ideas_count',
      depth: 0,
    });

    if (!filterCounts) {
      return null;
    }

    return (
      <TopicsFilter
        className={className}
        topics={topics?.data}
        selectedTopicIds={selectedTopicIds}
        onChange={onChange}
        filterCounts={filterCounts}
      />
    );
  }
);

export default TopicFilterBox;
