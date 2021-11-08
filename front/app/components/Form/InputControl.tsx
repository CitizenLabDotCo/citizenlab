import { withJsonFormsControlProps } from '@jsonforms/react';
import { Input } from 'cl2-component-library';
import { isControl, RankedTester, rankWith } from '@jsonforms/core';
import React, { useState } from 'react';

interface InputControlProps {
  data: any;
  handleChange(path: string, value: any): void;
  path: string;
  errors: string;
  schema: any;
}

const InputControl = (props: InputControlProps) => {
  const { data, handleChange, path, errors, schema } = props;
  const [didBlur, setDidBlur] = useState(false);
  return (
    <Input
      type="text"
      value={data}
      onChange={(value) => handleChange(path, value)}
      maxCharCount={schema?.maxLength}
      error={didBlur ? errors : undefined}
      onBlur={() => setDidBlur(true)}
    />
  );
};

export default withJsonFormsControlProps(InputControl);

export const inputControlTester: RankedTester = rankWith(3, isControl);
