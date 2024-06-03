import React, { useState } from 'react';

import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';
import {
  ControlProps,
  isPrimitiveArrayControl,
  RankedTester,
  rankWith,
} from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';
import styled from 'styled-components';

import { FormLabel } from 'components/UI/FormComponents';
import MultipleSelect from 'components/UI/MultipleSelect';

import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';

import ErrorDisplay from '../ErrorDisplay';
import VerificationIcon from '../VerificationIcon';

import { getOptions, getSubtextElement } from './controlUtils';

const StyledMultipleSelect = styled(MultipleSelect)`
  flex-grow: 1;
`;

const MultiSelectControl = ({
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
  const options = getOptions(schema, 'multi');
  const isSmallerThanPhone = useBreakpoint('phone');

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
      <Box display="flex" flexDirection="row" overflow="visible">
        <Box flexGrow={1}>
          <StyledMultipleSelect
            value={data}
            options={options}
            onChange={(vals) => {
              setDidBlur(true);
              handleChange(
                path,
                vals.map((val) => val.value)
              );
            }}
            inputId={sanitizeForClassname(id)}
            disabled={uischema?.options?.readonly}
            // On phones, the keyboard that appears is too large
            // and covers the options. So we disable the search functionality
            isSearchable={!isSmallerThanPhone}
          />
        </Box>

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

export default withJsonFormsControlProps(MultiSelectControl);

export const multiSelectControlTester: RankedTester = rankWith(
  4,
  isPrimitiveArrayControl
);
