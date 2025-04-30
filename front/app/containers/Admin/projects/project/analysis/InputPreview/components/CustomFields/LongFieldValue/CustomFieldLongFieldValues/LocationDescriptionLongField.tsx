import React from 'react';

import { Box, Title, Text } from '@citizenlab/cl2-component-library';

import { IInputsData } from 'api/analysis_inputs/types';
import { IIdeaCustomField } from 'api/idea_custom_fields/types';

import T from 'components/T';

type Props = {
  input: IInputsData;
  customField: IIdeaCustomField;
};

const LocationDescriptionLongField = ({ input, customField }: Props) => {
  return (
    <Box>
      <Title variant="h5" m="0px">
        <T value={customField.data.attributes.title_multiloc} />
      </Title>
      <Text>{input.attributes.location_description}</Text>
    </Box>
  );
};

export default LocationDescriptionLongField;
