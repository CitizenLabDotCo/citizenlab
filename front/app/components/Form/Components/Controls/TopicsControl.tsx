import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import {
  scopeEndsWith,
  RankedTester,
  rankWith,
  ControlProps,
} from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';

import { FormLabel } from 'components/UI/FormComponents';
import TopicsPicker from 'components/UI/TopicsPicker';

import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';

import ErrorDisplay from '../ErrorDisplay';

import { getSubtextElement } from './controlUtils';

const TopicsControl = ({
  data: selectedTopicIds = [],
  path,
  handleChange,
  uischema,
  errors,
  schema,
  id,
  required,
  visible,
}: ControlProps) => {
  const availableTopics =
    (!Array.isArray(schema.items) && // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      (schema.items?.oneOf as { const: string; title: string }[])) ||
    [];

  const handleTopicsChange = (topicIds: string[]) => {
    handleChange(path, topicIds);
    setDidBlur(true);
  };
  const [didBlur, setDidBlur] = useState(false);

  if (!visible) {
    return null;
  }

  return (
    <Box id="e2e-idea-topics-input">
      <FormLabel
        htmlFor={sanitizeForClassname(id)}
        labelValue={getLabel(uischema, schema, path)}
        optional={!required}
        subtextValue={getSubtextElement(uischema.options?.description)}
        subtextSupportsHtml
      />
      <TopicsPicker
        selectedTopicIds={selectedTopicIds}
        onClick={handleTopicsChange}
        availableTopics={availableTopics}
        id={sanitizeForClassname(id)}
      />
      <ErrorDisplay
        inputId={sanitizeForClassname(id)}
        fieldPath={path}
        ajvErrors={errors}
        didBlur={didBlur}
      />
    </Box>
  );
};

export default withJsonFormsControlProps(TopicsControl);

export const topicsControlTester: RankedTester = rankWith(
  1000,
  scopeEndsWith('topic_ids')
);
