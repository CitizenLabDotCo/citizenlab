import { withJsonFormsControlProps } from '@jsonforms/react';
import { scopeEndsWith, RankedTester, rankWith } from '@jsonforms/core';
import React from 'react';

import TopicsPicker from 'components/UI/TopicsPicker';

interface TopicsControlProps {
  data: string[];
  handleChange(path: string, value: string[]): void;
  path: string;
  schema: any;
}

const TopicsControl = (props: TopicsControlProps) => {
  const { schema, data: selectedTopicIds = [], path, handleChange } = props;
  const availableTopics = schema?.items?.oneOf ?? [];

  const handleTopicsChange = (topicIds: string[]) => {
    handleChange(path, topicIds);
  };

  return (
    <TopicsPicker
      selectedTopicIds={selectedTopicIds}
      onChange={handleTopicsChange}
      availableTopics={availableTopics}
    />
  );
};

export default withJsonFormsControlProps(TopicsControl);

export const topicsControlTester: RankedTester = rankWith(
  4,
  scopeEndsWith('topics')
);
