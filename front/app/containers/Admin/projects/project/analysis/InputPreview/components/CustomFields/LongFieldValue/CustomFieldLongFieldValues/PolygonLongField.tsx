import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

import { IIdeaCustomField } from 'api/idea_custom_fields/types';

import T from 'components/T';

import PolygonMapPreview from '../../../MapPreview/PolygonMapPreview';

type Props = {
  rawValue: any;
  customField: IIdeaCustomField;
};

const PolygonLongField = ({ rawValue, customField }: Props) => {
  return (
    <Box>
      <Title variant="h5" m="0px" mb="4px">
        <T value={customField.data.attributes.title_multiloc} />
      </Title>
      <PolygonMapPreview rawValue={rawValue} />
    </Box>
  );
};

export default PolygonLongField;
