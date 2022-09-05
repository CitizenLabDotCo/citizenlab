import React, { useState } from 'react';
import moment from 'moment';

import { withJsonFormsControlProps } from '@jsonforms/react';
import { Box, DateInput } from '@citizenlab/cl2-component-library';
import {
  ControlProps,
  RankedTester,
  rankWith,
  isDateControl,
} from '@jsonforms/core';
import { FormLabel } from 'components/UI/FormComponents';
import ErrorDisplay from '../ErrorDisplay';
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';
import styled from 'styled-components';
import VerificationIcon from '../VerificationIcon';

const StyledDateInput = styled(DateInput)`
  flex-grow: 1;
`;

const DateControl = ({
  uischema,
  data,
  handleChange,
  path,
  errors,
  schema,
  id,
  required,
}: ControlProps) => {
  const [didBlur, setDidBlur] = useState(false);
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
        <StyledDateInput
          id={sanitizeForClassname(id)}
          value={data ? moment(data, 'YYYY-MM-DD') : null}
          onChange={(value) => {
            handleChange(path, value ? value.format('YYYY-MM-DD') : null);
            setDidBlur(true);
          }}
          disabled={uischema?.options?.readonly}
        />
        <VerificationIcon show={uischema?.options?.verificationLocked} />
      </Box>
      <ErrorDisplay ajvErrors={errors} fieldPath={path} didBlur={didBlur} />
    </>
  );
};

export default withJsonFormsControlProps(DateControl);

export const dateControlTester: RankedTester = rankWith(4, isDateControl);
