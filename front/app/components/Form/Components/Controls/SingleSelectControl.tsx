import { Box, IOption, Select } from '@citizenlab/cl2-component-library';
import {
  ControlProps,
  isOneOfControl,
  RankedTester,
  rankWith,
} from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { FormLabel } from 'components/UI/FormComponents';
import React, { useState } from 'react';
import styled from 'styled-components';
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';
import ErrorDisplay from '../ErrorDisplay';
import VerificationIcon from '../VerificationIcon';
import { getOptions } from './controlUtils';

const StyledSelect = styled(Select)`
  flex-grow: 1;
`;

const SingleSelectControl = ({
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
  const options = getOptions(schema, 'single');

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
        <StyledSelect
          value={{
            value: data,
            label: 'any',
          }} /* sad workaround waiting for PR in component library */
          options={options as IOption[]}
          onChange={(val) => {
            setDidBlur(true);
            handleChange(path, val?.value);
          }}
          key={sanitizeForClassname(id)}
          id={sanitizeForClassname(id)}
          aria-label={getLabel(uischema, schema, path)}
          canBeEmpty={!required}
          disabled={uischema?.options?.readonly}
        />
        <VerificationIcon show={uischema?.options?.verificationLocked} />
      </Box>
      <ErrorDisplay ajvErrors={errors} fieldPath={path} didBlur={didBlur} />
    </>
  );
};

export default withJsonFormsControlProps(SingleSelectControl);

export const singleSelectControlTester: RankedTester = rankWith(
  4,
  isOneOfControl
);
