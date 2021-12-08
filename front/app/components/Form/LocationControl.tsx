import React from 'react';

import { withJsonFormsControlProps } from '@jsonforms/react';
import { Box, LocationInput } from 'cl2-component-library';
import { RankedTester, rankWith, scopeEndsWith } from '@jsonforms/core';
import { FormLabelStyled } from 'components/UI/FormComponents';

interface LocationControlProps {
  uischema: any;
  data: any;
  handleChange(path: string, value: any): void;
  path: string;
}

const LocationControl = (props: LocationControlProps) => {
  const { uischema, data, handleChange, path } = props;

  return (
    <Box id="e2e-idea-location-input" width="100%" marginBottom="40px">
      <FormLabelStyled>{uischema.label}</FormLabelStyled>
      <LocationInput
        className="e2e-initiative-location-input"
        value={data}
        onChange={(location) => handleChange(path, location)}
        placeholder={''}
      />
    </Box>
  );
};

export default withJsonFormsControlProps(LocationControl);

export const locationControlTester: RankedTester = rankWith(
  4,
  scopeEndsWith('location')
);
