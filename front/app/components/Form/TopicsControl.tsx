import { withJsonFormsControlProps } from '@jsonforms/react';
import { scopeEndsWith, RankedTester, rankWith } from '@jsonforms/core';
import React from 'react';

import TopicsPicker from 'components/UI/TopicsPicker';

interface TopicsControlProps {
  data: string[];
  handleChange(path: string, value: any): void;
  path: string;
  schema: any;
}

const TopicsControl = (props: TopicsControlProps) => {
  const { schema, data: selectedTopicIds = [], path, handleChange } = props;
  const availableTopics = schema?.items?.oneOf ?? [];

  console.log(selectedTopicIds);

  const handleTopicsChange = (topicIds: string[]) => {
    handleChange(path, [...selectedTopicIds, ...topicIds]);
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
