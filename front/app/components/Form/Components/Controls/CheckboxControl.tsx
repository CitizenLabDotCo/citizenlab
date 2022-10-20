import React from 'react';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { Box, Checkbox } from '@citizenlab/cl2-component-library';
import {
  ControlProps,
  isBooleanControl,
  RankedTester,
  rankWith,
} from '@jsonforms/core';
import { WrappedComponentProps } from 'react-intl';
import ErrorDisplay from '../ErrorDisplay';
import { FormLabel } from 'components/UI/FormComponents';
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';
import VerificationIcon from '../VerificationIcon';

const CheckboxControl = ({
  data,
  handleChange,
  path,
  errors,
  schema,
  id,
  required,
  uischema,
}: ControlProps & WrappedComponentProps) => {
  return (
    <>
      <FormLabel
        htmlFor={sanitizeForClassname(id)}
        labelValue={getLabel(uischema, schema, path)}
        optional={!required}
        subtextValue={uischema.options?.description}
        subtextSupportsHtml
      />
      <Box display="flex" flexDirection="row">
        <Checkbox
          id={sanitizeForClassname(id)}
          checked={Boolean(data)}
          onChange={() => handleChange(path, !data)}
          label={schema.description || null}
          disabled={uischema?.options?.readonly}
        />
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
