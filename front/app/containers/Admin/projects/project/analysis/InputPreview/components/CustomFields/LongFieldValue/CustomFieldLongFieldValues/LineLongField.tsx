import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

import { IIdeaCustomField } from 'api/idea_custom_fields/types';

import T from 'components/T';

import LineMapPreview from '../../../MapPreview/LineMapPreview';

type Props = {
  rawValue: any;
  customField: IIdeaCustomField;
};

const LineLongField = ({ rawValue, customField }: Props) => {
  return (
    <Box>
      <Title variant="h5" m="0px" mb="4px">
        <T value={customField.data.attributes.title_multiloc} />
      </Title>
      <LineMapPreview rawValue={rawValue} />
    </Box>
  );
};

export default LineLongField;
