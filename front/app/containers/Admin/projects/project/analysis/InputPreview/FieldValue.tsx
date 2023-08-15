import React from 'react';

import { IInput } from 'api/analysis_inputs/types';
import useIdeaCustomField from 'api/idea_custom_fields/useIdeaCustomField';

import { Box, Title, Text } from '@citizenlab/cl2-component-library';

import T from 'components/T';

type Props = {
  customFieldId: string;
  input: IInput;
  projectId?: string;
  phaseId?: string;
};

/**
 * Given a custom_field definition and an input, render a textual representation
 * of the value of the custom field for that input
 */
const FieldValue = ({ projectId, phaseId, customFieldId, input }: Props) => {
  const containerId: { projectId?: string; phaseId?: string } = {};
  if (projectId) {
    containerId.projectId = projectId;
  } else {
    containerId.phaseId = phaseId;
  }
  const { data: customField } = useIdeaCustomField({
    customFieldId,
    ...containerId,
  });

  if (!customField) return null;

  switch (customField.data.attributes.code) {
    case 'title_multiloc':
      return (
        <Box>
          <Title variant="h3">
            <T
              value={input.data.attributes[customField.data.attributes.key]}
              supportHtml={true}
            />
          </Title>
        </Box>
      );
    case 'body_multiloc':
      return (
        <Text>
          <T
            value={input.data.attributes[customField.data.attributes.key]}
            supportHtml={true}
          />
        </Text>
      );
    case 'location_description':
      if (input.data.attributes.location_description) {
        return (
          <Box>
            <Title variant="h5">
              <T value={customField.data.attributes.title_multiloc} />
            </Title>
            <Text>{input.data.attributes.location_description}</Text>
          </Box>
        );
      } else {
        return null;
      }
    case null:
      return (
        <Box>
          <Title variant="h5">
            <T value={customField.data.attributes.title_multiloc} />
          </Title>
          <Text>
            {input.data.attributes.custom_field_values[
              customField.data.attributes.key
            ] || 'No answer'}
          </Text>
        </Box>
      );
    default:
      return null;
  }
};

export default FieldValue;
