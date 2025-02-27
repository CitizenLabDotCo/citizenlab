import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

import { IInputsData } from 'api/analysis_inputs/types';
import { IIdeaCustomField } from 'api/idea_custom_fields/types';

import T from 'components/T';

type Props = {
  input: IInputsData;
  customField: IIdeaCustomField;
};

const TitleMultilocLongField = ({ input, customField }: Props) => {
  return (
    <Box>
      <Title variant="h3" my="0px">
        <T
          value={input.attributes[customField.data.attributes.key]}
          supportHtml={true}
        />
      </Title>
    </Box>
  );
};

export default TitleMultilocLongField;
