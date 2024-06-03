import React, { useState } from 'react';

import { Box, IOption, Select } from '@citizenlab/cl2-component-library';
import {
  ControlProps,
  isEnumControl,
  RankedTester,
  rankWith,
} from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';
import styled from 'styled-components';

import { FormLabel } from 'components/UI/FormComponents';

import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';

import ErrorDisplay from '../ErrorDisplay';
import VerificationIcon from '../VerificationIcon';

import { getOptions, getSubtextElement } from './controlUtils';

const StyledSelect = styled(Select)`
  flex-grow: 1;
`;

const SingleSelectEnumControl = ({
  data,
  handleChange,
  path,
  errors,
  schema,
  uischema,
  required,
  id,
  visible,
}: ControlProps) => {
  const [didBlur, setDidBlur] = useState(false);
  const options = getOptions(schema, 'singleEnum', uischema);

  if (!visible) {
    return null;
  }

  return (
    <>
      <FormLabel
        htmlFor={sanitizeForClassname(id)}
        labelValue={getLabel(uischema, schema, path)}
        optional={!required}
        subtextValue={getSubtextElement(uischema.options?.description)}
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
      <ErrorDisplay
        inputId={id}
        ajvErrors={errors}
        fieldPath={path}
        didBlur={didBlur}
      />
    </>
  );
};

export default withJsonFormsControlProps(SingleSelectEnumControl);

export const SingleSelectEnumControlTester: RankedTester = rankWith(
  4,
  isEnumControl
);
