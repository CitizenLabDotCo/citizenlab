import * as React from 'react';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { Input } from 'cl2-component-library';
import { isControl, RankedTester, rankWith } from '@jsonforms/core';

interface InputControlProps {
  data: any;
  handleChange(path: string, value: any): void;
  path: string;
}

const InputControl = ({ data, handleChange, path }: InputControlProps) => {
  return (
    <Input
      type="text"
      value={data}
      onChange={(value) => handleChange(path, value)}
    />
  );
};

export default withJsonFormsControlProps(InputControl);

export const inputControlTester: RankedTester = rankWith(3, isControl);
