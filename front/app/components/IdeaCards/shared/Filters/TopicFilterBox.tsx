import React, { memo } from 'react';
import TopicsFilter from 'components/FilterBoxes/TopicsFilter';
import useTopics from 'api/topics/useTopics';

interface Props {
  selectedTopicIds: string[] | null | undefined;
  onChange: (arg: string[] | null) => void;
  className?: string;
}

const TopicFilterBox = memo<Props>(
  ({ selectedTopicIds, onChange, className }) => {
    const { data: topics } = useTopics();

    if (topics && topics.data.length > 0) {
      return (
        <TopicsFilter
          className={className}
          topics={topics.data}
          selectedTopicIds={selectedTopicIds}
          onChange={onChange}
        />
      );
    }

    return null;
  }
);

export default TopicFilterBox;
