import { withJsonFormsControlProps } from '@jsonforms/react';
import { Input } from 'cl2-component-library';
import {
  ControlProps,
  isControl,
  RankedTester,
  rankWith,
} from '@jsonforms/core';
import React, { useCallback, useState } from 'react';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import ErrorDisplay from './ErrorDisplay';
import { FormLabel } from 'components/UI/FormComponents';
import { getLabel } from 'utils/JSONFormUtils';

const InputControl = ({
  data,
  handleChange,
  path,
  errors,
  schema,
  id,
  required,
  uischema,
}: ControlProps & InjectedIntlProps) => {
  const [didBlur, setDidBlur] = useState(false);

  const onChange = useCallback(
    (value: string) =>
      handleChange(
        path,
        schema.type === 'number' && value ? parseInt(value, 10) : value
      ),
    [schema.type, handleChange, path]
  );

  return (
    <>
      <FormLabel
        htmlFor={id}
        labelValue={getLabel(uischema, schema, path)}
        optional={!required}
        subtextValue={schema.description}
        subtextSupportsHtml
      />
      <Input
        id={id}
        type={schema.type === 'number' ? 'number' : 'text'}
        value={data}
        onChange={onChange}
        maxCharCount={schema?.maxLength}
        onBlur={() => setDidBlur(true)}
      />
      <ErrorDisplay ajvErrors={didBlur ? errors : undefined} fieldPath={path} />
    </>
  );
};

export default withJsonFormsControlProps(injectIntl(InputControl));

export const inputControlTester: RankedTester = rankWith(3, isControl);
