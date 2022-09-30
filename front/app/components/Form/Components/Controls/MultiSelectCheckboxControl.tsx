import { withJsonFormsControlProps } from '@jsonforms/react';
import {
  ControlProps,
  isPrimitiveArrayControl,
  RankedTester,
  rankWith,
} from '@jsonforms/core';
import React, { useState } from 'react';
import ErrorDisplay from '../ErrorDisplay';
import { Box, Checkbox } from '@citizenlab/cl2-component-library';
import { FormLabel } from 'components/UI/FormComponents';
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';
import VerificationIcon from '../VerificationIcon';
import { isArray } from 'lodash-es';

const MultiSelectCheckboxControl = ({
  data,
  handleChange,
  path,
  errors,
  schema,
  uischema,
  required,
  id,
}: ControlProps) => {
  const [didBlur, setDidBlur] = useState(false);

  const options =
    (!Array.isArray(schema.items) &&
      schema.items?.oneOf?.map((o) => ({
        value: o.const as string,
        label: (o.title || o.const) as string,
      }))) ||
    null;

  const dataArray = isArray(data) && data !== [] ? data : [];

  return (
    <>
      <FormLabel
        htmlFor={sanitizeForClassname(id)}
        labelValue={getLabel(uischema, schema, path)}
        optional={!required}
        subtextValue={uischema.options?.description}
        subtextSupportsHtml
      />
      <Box mt="16px" display="block">
        {options?.map((option) => (
          <Box mt="12px" key={option.value}>
            <Checkbox
              label={option.label}
              checked={dataArray.includes(option.value)}
              onChange={() => {
                if (dataArray.includes(option.value)) {
                  handleChange(
                    path,
                    dataArray.filter((value) => value !== option.value)
                  );
                } else {
                  handleChange(path, [...dataArray, option.value]);
                }
                setDidBlur(true);
              }}
            />
          </Box>
        ))}
        <VerificationIcon show={uischema?.options?.verificationLocked} />
      </Box>
      <ErrorDisplay ajvErrors={errors} fieldPath={path} didBlur={didBlur} />
    </>
  );
};

export default withJsonFormsControlProps(MultiSelectCheckboxControl);

export const multiSelectCheckboxControlTester: RankedTester = rankWith(
  10,
  isPrimitiveArrayControl
);
