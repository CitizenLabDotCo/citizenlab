import { Box, Input } from '@citizenlab/cl2-component-library';
import {
  ControlProps,
  isControl,
  RankedTester,
  rankWith,
} from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { FormLabel } from 'components/UI/FormComponents';
import React, { useCallback, useState } from 'react';
import { isString } from 'utils/helperUtils';
import { sanitizeForClassname } from 'utils/JSONFormUtils';
import ErrorDisplay from '../ErrorDisplay';
import VerificationIcon from '../VerificationIcon';

export const InputControl = ({
  data,
  handleChange,
  path,
  errors,
  schema,
  id,
  required,
  uischema,
  label,
}: ControlProps) => {
  const [didBlur, setDidBlur] = useState(false);

  const onChange = useCallback(
    (value: string) => {
      handleChange(
        path,
        schema.type === 'number' && value ? parseInt(value, 10) : value
      );
    },
    [schema.type, handleChange, path]
  );

  return (
    <>
      <FormLabel
        htmlFor={sanitizeForClassname(id)}
        labelValue={label}
        optional={!required}
        subtextValue={uischema.options?.description}
        subtextSupportsHtml
      />
      <Box display="flex" flexDirection="row">
        <Input
          data-testid="inputControl"
          id={sanitizeForClassname(id)}
          className={`input_field_root_${label}`}
          type={schema.type === 'number' ? 'number' : 'text'}
          value={data}
          onChange={onChange}
          maxCharCount={schema?.maxLength}
          onBlur={() => {
            uischema?.options?.transform === 'trim_on_blur' &&
              isString(data) &&
              onChange(data.trim());
            setDidBlur(true);
          }}
          disabled={uischema?.options?.readonly}
        />
        <VerificationIcon show={uischema?.options?.verificationLocked} />
      </Box>
      <ErrorDisplay ajvErrors={errors} fieldPath={path} didBlur={didBlur} />
    </>
  );
};

export default withJsonFormsControlProps(InputControl);

export const inputControlTester: RankedTester = rankWith(3, isControl);
