import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

import { IInputsData } from 'api/analysis_inputs/types';
import { IIdeaCustomField } from 'api/idea_custom_fields/types';

import T from 'components/T';

import ShapefilePreview from '../../../MapPreview/ShapefilePreview';

type Props = {
  input: IInputsData;
  rawValue: any;
  customField: IIdeaCustomField;
};

const ShapefileLongField = ({ input, rawValue, customField }: Props) => {
  return (
    <Box>
      <Title variant="h5" m="0px">
        <T value={customField.data.attributes.title_multiloc} />
      </Title>
      <ShapefilePreview inputId={input.id} file={rawValue} />
    </Box>
  );
};

export default ShapefileLongField;
