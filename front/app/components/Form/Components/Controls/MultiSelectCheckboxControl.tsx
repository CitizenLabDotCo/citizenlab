import { withJsonFormsControlProps } from '@jsonforms/react';
import React, { useState } from 'react';
import { Box, Checkbox, Text } from '@citizenlab/cl2-component-library';
import {
  ControlProps,
  isPrimitiveArrayControl,
  RankedTester,
  rankWith,
} from '@jsonforms/core';
// utils
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';
import { FormattedMessage } from 'utils/cl-intl';
import { FormLabel } from 'components/UI/FormComponents';
import ErrorDisplay from '../ErrorDisplay';
// components
import VerificationIcon from '../VerificationIcon';
import { getOptions } from './controlUtils';
import messages from './messages';

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

  const options = getOptions(schema, 'multi');

  const dataArray = Array.isArray(data) && data !== [] ? data : [];

  return (
    <>
      <FormLabel
        htmlFor={sanitizeForClassname(id)}
        labelValue={getLabel(uischema, schema, path)}
        optional={!required}
        subtextValue={uischema.options?.description}
        subtextSupportsHtml
      />
      <Box display="block" id="e2e-multiselect-control">
        <Text fontSize="s">
          <FormattedMessage {...messages.selectMany} />
        </Text>
        {options?.map((option, index: number) => (
          <Box mt="12px" key={option.value}>
            <Checkbox
              id={`${path}-checkbox-${index}`}
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
