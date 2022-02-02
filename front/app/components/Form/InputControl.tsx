import { withJsonFormsControlProps } from '@jsonforms/react';
import { Input } from '@citizenlab/cl2-component-library';
import {
  ControlProps,
  isControl,
  RankedTester,
  rankWith,
} from '@jsonforms/core';
import React, { useState } from 'react';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import ErrorDisplay from './ErrorDisplay';

const InputControl = (props: ControlProps & InjectedIntlProps) => {
  const { data, handleChange, path, errors, schema } = props;
  const [didBlur, setDidBlur] = useState(false);

  return (
    <>
      <Input
        type="text"
        value={data}
        onChange={(value) => handleChange(path, value)}
        maxCharCount={schema?.maxLength}
        onBlur={() => setDidBlur(true)}
      />
      <ErrorDisplay ajvErrors={didBlur ? errors : undefined} fieldPath={path} />
    </>
  );
};

export default withJsonFormsControlProps(injectIntl(InputControl));

export const inputControlTester: RankedTester = rankWith(3, isControl);
