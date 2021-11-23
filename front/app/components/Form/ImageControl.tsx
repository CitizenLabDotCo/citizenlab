import { withJsonFormsControlProps } from '@jsonforms/react';
import { Box } from 'cl2-component-library';
import { RankedTester, rankWith, scopeEndsWith } from '@jsonforms/core';
import React from 'react';
import { FormLabelStyled } from 'components/UI/FormComponents';

interface InputControlProps {
  data: any;
  handleChange(path: string, value: any): void;
  path: string;
  errors: string;
  schema: any;
  uischema: any;
}

const ImageControl = (props: InputControlProps) => {
  const { uischema } = props;
  return (
    <Box id="e2e-idea-image-input" width="100%" marginBottom="40px">
      <FormLabelStyled>{uischema.label}</FormLabelStyled>
      {/* <Input
        type="text"
        value={data}
        onChange={(value) => handleChange(path, value)}
        maxCharCount={schema?.maxLength}
        error={didBlur ? errors : undefined}
        onBlur={() => setDidBlur(true)}
      /> */}
    </Box>
  );
};

export default withJsonFormsControlProps(ImageControl);

export const imageControlTester: RankedTester = rankWith(4, scopeEndsWith('image'));
