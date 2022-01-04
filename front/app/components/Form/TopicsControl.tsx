import { withJsonFormsControlProps } from '@jsonforms/react';
import {
  scopeEndsWith,
  RankedTester,
  rankWith,
  ControlProps,
} from '@jsonforms/core';
import React from 'react';

import TopicsPicker from 'components/UI/TopicsPicker';
import { FormLabelStyled } from 'components/UI/FormComponents';
import { Box } from 'cl2-component-library';
import ErrorDisplay from './ErrorDisplay';
import { ITopicData } from 'services/topics';

const TopicsControl = (props: ControlProps) => {
  const {
    data: selectedTopicIds = [],
    path,
    handleChange,
    uischema,
    errors,
  } = props;
  const availableTopics = uischema?.options ?? [];

  const handleTopicsChange = (topicIds: string[]) => {
    handleChange(path, topicIds);
  };

  return (
    <Box id="e2e-idea-topics-input" width="100%" marginBottom="40px">
      <FormLabelStyled>{uischema.label}</FormLabelStyled>
      <TopicsPicker
        selectedTopicIds={selectedTopicIds}
        onChange={handleTopicsChange}
        availableTopics={availableTopics as ITopicData[]}
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
