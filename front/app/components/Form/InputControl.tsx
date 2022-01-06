import { withJsonFormsControlProps } from '@jsonforms/react';
import { Input } from 'cl2-component-library';
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
import { FormLabelValue } from 'components/UI/FormComponents';

const InputControl = (props: ControlProps & InjectedIntlProps) => {
  const { data, handleChange, path, errors, schema } = props;
  const [didBlur, setDidBlur] = useState(false);

  return (
    <>
      {schema.title && (
        <FormLabelValue
          // htmlFor={id}
          labelValue={schema.title}
          // optional={!required}
          // subtextValue={e.description}
        />
      )}
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
