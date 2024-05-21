import React from 'react';

import { Box, Checkbox } from '@citizenlab/cl2-component-library';
import {
  ControlProps,
  isBooleanControl,
  RankedTester,
  rankWith,
} from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';

import { FormLabel } from 'components/UI/FormComponents';

import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';

import ErrorDisplay from '../ErrorDisplay';
import VerificationIcon from '../VerificationIcon';

import { getSubtextElement } from './controlUtils';

const CheckboxControl = ({
  data,
  handleChange,
  path,
  errors,
  schema,
  id,
  required,
  uischema,
  visible,
}: ControlProps) => {
  if (!visible) {
    return null;
  }

  return (
    <>
      <Box display="flex" alignItems="flex-start">
        <Checkbox
          id={sanitizeForClassname(id)}
          checked={Boolean(data)}
          onChange={() => handleChange(path, !data)}
          disabled={uischema?.options?.readonly}
          mr="4px"
        />
        <FormLabel
          htmlFor={sanitizeForClassname(id)}
          labelValue={getLabel(uischema, schema, path)}
          optional={!required}
          subtextValue={getSubtextElement(uischema.options?.description)}
          subtextSupportsHtml
        />
        {/* TO DO: add to FormLabel? */}
        <VerificationIcon show={uischema?.options?.verificationLocked} />
      </Box>
      <ErrorDisplay ajvErrors={errors} fieldPath={path} didBlur={false} />
    </>
  );
};

export default withJsonFormsControlProps(CheckboxControl);

export const checkboxControlTester: RankedTester = rankWith(
  4,
  isBooleanControl
);
