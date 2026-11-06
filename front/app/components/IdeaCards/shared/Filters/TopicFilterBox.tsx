import React, { memo } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useCustomFields from 'api/custom_fields/useCustomFields';
import useInputTopics from 'api/input_topics/useInputTopics';

import TopicsFilter from 'components/FilterBoxes/TopicsFilter';
import { FilterCounts } from 'components/FilterBoxes/types';

interface Props {
  projectId: string;
  phaseId: string;
  filterCounts: FilterCounts;
  selectedTopicIds: string[] | null | undefined;
  onChange: (arg: string[] | null) => void;
  className?: string;
}

const TopicFilterBox = memo<Props>(
  ({
    projectId,
    phaseId,
    selectedTopicIds,
    filterCounts,
    onChange,
    className,
  }) => {
    // Public fields only include the enabled ones.
    const { data: customFields } = useCustomFields({
      phaseId,
      publicFields: true,
    });
    const topicsEnabled = customFields?.some(
      (field) => field.code === 'topic_ids'
    );

    const { data: topics } = useInputTopics(projectId, {
      sort: '-ideas_count',
      depth: 0,
    });

    if (
      !topicsEnabled ||
      !topics ||
      topics.data.length === 0 ||
      !filterCounts
    ) {
      return null;
    }

    return (
      <Box mb="20px">
        <TopicsFilter
          className={className}
          topics={topics.data}
          selectedTopicIds={selectedTopicIds}
          onChange={onChange}
          filterCounts={filterCounts}
        />
      </Box>
    );
  }
);

export default TopicFilterBox;
