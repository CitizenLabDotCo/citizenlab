import React from 'react';

import { IInputsData } from 'api/analysis_inputs/types';
import useIdeaCustomField from 'api/idea_custom_fields/useIdeaCustomField';

import ShortInputFieldValue from '../components/ShortInputFieldValue';

type Props = {
  customFieldId: string;
  input: IInputsData;
  projectId?: string;
  phaseId?: string;
};

/**
 * Given a custom_field definition and an input, render a one-line textual
 * representation of the value of the custom field for that input. Only renders
 * anything for non-built-in custom fields
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

  const rawValue =
    input.attributes.custom_field_values[customField.data.attributes.key];

  return <ShortInputFieldValue customField={customField} rawValue={rawValue} />;
};

export default FieldValue;
