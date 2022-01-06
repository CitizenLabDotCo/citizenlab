import { withJsonFormsControlProps } from '@jsonforms/react';
import { scopeEndsWith, RankedTester, rankWith } from '@jsonforms/core';
import React from 'react';

import TopicsPicker from 'components/UI/TopicsPicker';
import { FormLabelStyled } from 'components/UI/FormComponents';
import { Box } from 'cl2-component-library';
import ErrorDisplay from './ErrorDisplay';
import { getLabel } from 'utils/JSONFormUtils';

interface TopicsControlProps {
  data: string[];
  handleChange(path: string, value: string[]): void;
  path: string;
  schema: any;
  uischema: any;
  errors: string;
}

const TopicsControl = (props: TopicsControlProps) => {
  const {
    data: selectedTopicIds = [],
    path,
    handleChange,
    uischema,
    errors,
    schema,
  } = props;
  const availableTopics = uischema?.options ?? [];

  const handleTopicsChange = (topicIds: string[]) => {
    handleChange(path, topicIds);
  };

  return (
    <Box id="e2e-idea-topics-input" width="100%" marginBottom="40px">
      <FormLabelStyled>{getLabel(uischema, schema, path)}</FormLabelStyled>
      <TopicsPicker
        selectedTopicIds={selectedTopicIds}
        onChange={handleTopicsChange}
        availableTopics={availableTopics}
      />
      <ErrorDisplay fieldPath={path} ajvErrors={errors} />
    </Box>
  );
};

export default withJsonFormsControlProps(TopicsControl);

export const topicsControlTester: RankedTester = rankWith(
  4,
  scopeEndsWith('topic_ids')
);
