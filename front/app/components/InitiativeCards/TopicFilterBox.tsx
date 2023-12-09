import React, { memo, useCallback } from 'react';

// components
import TopicsFilter from 'components/FilterBoxes/TopicsFilter';

// styling
import useTopics from 'api/topics/useTopics';

interface Props {
  selectedTopicIds: string[] | null | undefined;
  onChange: (arg: string[] | null) => void;
  className?: string;
}

const TopicFilterBox = memo<Props>(
  ({ selectedTopicIds, onChange, className }) => {
    const { data: topics } = useTopics({ excludeCode: 'custom' });
    const handleOnChange = useCallback(
      (newsSelectedTopicIds: string[] | null) => {
        onChange(newsSelectedTopicIds);
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      []
    );

    if (topics && topics.data.length > 0) {
      return (
        <TopicsFilter
          className={className}
          topics={topics.data}
          selectedTopicIds={selectedTopicIds}
          onChange={handleOnChange}
        />
      );
    }

    return null;
  }
);

export default TopicFilterBox;
