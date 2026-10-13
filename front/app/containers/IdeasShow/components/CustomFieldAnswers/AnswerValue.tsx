import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { IFlatCustomField } from 'api/custom_fields/types';

import MultiSelectField from 'components/CustomFieldsForm/Fields/MultiSelectField';
import SingleSelectField from 'components/CustomFieldsForm/Fields/SingleSelectField';

interface Props {
  field: IFlatCustomField;
  answer: unknown;
}

const AnswerValue = ({ field, answer }: Props) => {
  switch (field.input_type) {
    case 'text':
      return typeof answer === 'string' ? <Text m="0px">{answer}</Text> : null;
    case 'select':
      return (
        <Box style={{ pointerEvents: 'none' }}>
          <SingleSelectField question={field} disabled />
        </Box>
      );
    case 'multiselect':
      return (
        <Box style={{ pointerEvents: 'none' }}>
          <MultiSelectField question={field} disabled />
        </Box>
      );
    default:
      return null;
  }
};

export default AnswerValue;
