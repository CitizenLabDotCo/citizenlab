import React from 'react';

import { Text } from '@citizenlab/cl2-component-library';

import { IInputsData } from 'api/analysis_inputs/types';
import { IIdeaCustomField } from 'api/idea_custom_fields/types';

import T from 'components/T';

type Props = {
  input: IInputsData;
  customField: IIdeaCustomField;
};

const BodyMultilocLongField = ({ input, customField }: Props) => {
  return (
    <Text>
      <T
        value={input.attributes[customField.data.attributes.key]}
        supportHtml={true}
      />
    </Text>
  );
};

export default BodyMultilocLongField;
