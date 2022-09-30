import { withJsonFormsControlProps } from '@jsonforms/react';
import {
  ControlProps,
  isOneOfControl,
  RankedTester,
  rankWith,
} from '@jsonforms/core';
import React, { useState } from 'react';
import ErrorDisplay from '../ErrorDisplay';
import { Box, Radio } from '@citizenlab/cl2-component-library';
import { FormLabel } from 'components/UI/FormComponents';
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';
import VerificationIcon from '../VerificationIcon';

const SingleSelectRadioControl = ({
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
    schema?.oneOf
      ?.map((o) => ({
        value: o.const,
        label: o.title || o.const,
      }))
      .filter((e) => e.value && e.label) || null;

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
            <Radio
              name="name-temp"
              label={option.label}
              currentValue={data}
              value={option.value}
              onChange={() => {
                handleChange(path, option.value);
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

export default withJsonFormsControlProps(SingleSelectRadioControl);

export const singleSelectRadioControlTester: RankedTester = rankWith(
  10,
  isOneOfControl
);
