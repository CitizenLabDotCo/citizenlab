import React from 'react';

import { Text } from '@citizenlab/cl2-component-library';

import { IFlatCustomField } from 'api/custom_fields/types';

interface Props {
  field: IFlatCustomField;
  answer: unknown;
}

const AnswerValue = ({ field, answer }: Props) => {
  switch (field.input_type) {
    case 'text':
      return typeof answer === 'string' ? <Text m="0px">{answer}</Text> : null;
    default:
      return null;
  }
};

export default AnswerValue;
