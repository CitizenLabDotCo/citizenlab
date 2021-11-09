import { withJsonFormsControlProps } from '@jsonforms/react';
import { scopeEndsWith, RankedTester, rankWith } from '@jsonforms/core';
import React from 'react';

import TopicsPicker from 'components/UI/TopicsPicker';

interface TopicsControlProps {
  schema: any;
}

const TopicsControl = (props: TopicsControlProps) => {
  const availableTopics = props?.schema?.items?.oneOf ?? [];
  console.log(availableTopics);
  const selectedTopicIds = [];

  const handleTopicsChange = (value) => {
    console.log(value);
  };

  return (
    <TopicsPicker
      selectedTopicIds={selectedTopicIds}
      onChange={handleTopicsChange}
      availableTopics={[]}
    />
  );
};

export default withJsonFormsControlProps(TopicsControl);

export const topicsControlTester: RankedTester = rankWith(
  4,
  scopeEndsWith('topics')
);
