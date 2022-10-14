import { withJsonFormsControlProps } from '@jsonforms/react';
import {
  ControlProps,
  isPrimitiveArrayControl,
  RankedTester,
  rankWith,
} from '@jsonforms/core';
import React, { useState } from 'react';
import ErrorDisplay from '../ErrorDisplay';
import { Box } from '@citizenlab/cl2-component-library';
import { FormLabel } from 'components/UI/FormComponents';
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';
import styled from 'styled-components';
import MultipleSelect from 'components/UI/MultipleSelect';
import VerificationIcon from '../VerificationIcon';
import { getOptions } from './controlUtils';

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
}: ControlProps) => {
  const [didBlur, setDidBlur] = useState(false);
  const options = getOptions(schema, 'multi');

  return (
    <>
      <FormLabel
        htmlFor={sanitizeForClassname(id)}
        labelValue={getLabel(uischema, schema, path)}
        optional={!required}
        subtextValue={uischema.options?.description}
        subtextSupportsHtml
      />
      <Box display="flex" flexDirection="row" overflow="visible">
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
        />
        <VerificationIcon show={uischema?.options?.verificationLocked} />
      </Box>
      <ErrorDisplay ajvErrors={errors} fieldPath={path} didBlur={didBlur} />
    </>
  );
};

export default withJsonFormsControlProps(MultiSelectControl);

export const multiSelectControlTester: RankedTester = rankWith(
  4,
  isPrimitiveArrayControl
);
