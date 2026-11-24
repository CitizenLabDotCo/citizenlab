import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

import { IIdeaCustomField } from 'api/idea_custom_fields/types';

import T from 'components/T';

import MultipointMapPreview from '../../../MapPreview/MultipointMapPreview';

type Props = {
  rawValue: any;
  customField: IIdeaCustomField;
};

const MultipointLongField = ({ rawValue, customField }: Props) => {
  return (
    <Box>
      <Title variant="h5" m="0px" mb="4px">
        <T value={customField.data.attributes.title_multiloc} />
      </Title>
      <MultipointMapPreview rawValue={rawValue} />
    </Box>
  );
};

export default MultipointLongField;
