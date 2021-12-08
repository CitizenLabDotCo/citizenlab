import React from 'react';

import { withJsonFormsControlProps } from '@jsonforms/react';
import { Box } from 'cl2-component-library';
import { RankedTester, rankWith, scopeEndsWith } from '@jsonforms/core';
import { FormLabelStyled } from 'components/UI/FormComponents';

interface LocationControlProps {
  uischema: any;
}

const LocationControl = (props: LocationControlProps) => {
  const { uischema } = props;

  return (
    <Box id="e2e-idea-location-input" width="100%" marginBottom="40px">
      <FormLabelStyled>{uischema.label}</FormLabelStyled>
    </Box>
  );
};

export default withJsonFormsControlProps(LocationControl);

export const inputControlTester: RankedTester = rankWith(
  3,
  scopeEndsWith('location')
);
