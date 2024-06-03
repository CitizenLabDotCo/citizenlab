import React, { useCallback, useState } from 'react';

import { Box, Input } from '@citizenlab/cl2-component-library';
import { ControlProps, RankedTester, rankWith } from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';

import { FormLabel } from 'components/UI/FormComponents';

import { isString } from 'utils/helperUtils';
import {
  sanitizeForClassname,
  getFieldNameFromPath,
} from 'utils/JSONFormUtils';

import ErrorDisplay from '../ErrorDisplay';
import VerificationIcon from '../VerificationIcon';

import { getSubtextElement } from './controlUtils';

export const TitleControl = ({
  data,
  handleChange,
  path,
  errors,
  schema,
  id,
  required,
  uischema,
  label,
  visible,
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

  if (!visible) {
    return null;
  }

  return (
    <Box id="e2e-idea-title-input">
      <FormLabel
        htmlFor={sanitizeForClassname(id)}
        labelValue={label}
        optional={!required}
        subtextValue={getSubtextElement(uischema.options?.description)}
        subtextSupportsHtml
      />
      <Box display="flex" flexDirection="row">
        <Input
          data-testid="inputControl"
          id={sanitizeForClassname(id)}
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
      <ErrorDisplay
        inputId={id}
        ajvErrors={errors}
        fieldPath={path}
        didBlur={didBlur}
      />
    </Box>
  );
};

export default withJsonFormsControlProps(TitleControl);

export const titleControlTester: RankedTester = rankWith(1000, (uischema) =>
  (uischema as any)?.scope
    ? getFieldNameFromPath((uischema as any)?.scope) === 'title_multiloc'
    : false
);
