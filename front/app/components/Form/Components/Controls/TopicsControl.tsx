import { withJsonFormsControlProps } from '@jsonforms/react';
import {
  scopeEndsWith,
  RankedTester,
  rankWith,
  ControlProps,
} from '@jsonforms/core';
import React from 'react';

import TopicsPicker from 'components/UI/TopicsPicker';
import { FormLabel } from 'components/UI/FormComponents';
import ErrorDisplay from '../ErrorDisplay';
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';

const TopicsControl = ({
  data: selectedTopicIds = [],
  path,
  handleChange,
  uischema,
  errors,
  schema,
  id,
  required,
}: ControlProps) => {
  const availableTopics =
    (!Array.isArray(schema.items) &&
      (schema.items?.oneOf as { const: string; title: string }[])) ||
    [];

  const handleTopicsChange = (topicIds: string[]) => {
    handleChange(path, topicIds);
  };

  return (
    <>
      <FormLabel
        htmlFor={sanitizeForClassname(id)}
        labelValue={getLabel(uischema, schema, path)}
        optional={!required}
        subtextValue={schema.description}
        subtextSupportsHtml
      />
      <TopicsPicker
        selectedTopicIds={selectedTopicIds}
        onChange={handleTopicsChange}
        availableTopics={availableTopics}
        id={sanitizeForClassname(id)}
      />
      <ErrorDisplay fieldPath={path} ajvErrors={errors} />
    </>
  );
};

export default withJsonFormsControlProps(TopicsControl);

export const topicsControlTester: RankedTester = rankWith(
  10,
  scopeEndsWith('topic_ids')
);
