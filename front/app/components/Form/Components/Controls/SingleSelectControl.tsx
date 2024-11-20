import React, { useState } from 'react';

import { Box, IOption, Select } from '@citizenlab/cl2-component-library';
import {
  ControlProps,
  isOneOfControl,
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

const SingleSelectControl = ({
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
  const options = getOptions(schema, 'single');

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
          value={data}
          options={options as IOption[]}
          onChange={(val) => {
            setDidBlur(true);
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            handleChange(path, val?.value);
          }}
          key={sanitizeForClassname(id)}
          id={sanitizeForClassname(id)}
          aria-label={getLabel(uischema, schema, path)}
          canBeEmpty // see Select component for more info
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          disabled={uischema?.options?.readonly}
        />
        {/* TODO: Fix this the next time the file is edited. */}
        {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
        <VerificationIcon show={uischema?.options?.verificationLocked} />
      </Box>
      <ErrorDisplay
        inputId={sanitizeForClassname(id)}
        ajvErrors={errors}
        fieldPath={path}
        didBlur={didBlur}
      />
    </>
  );
};

export default withJsonFormsControlProps(SingleSelectControl);

export const singleSelectControlTester: RankedTester = rankWith(
  4,
  isOneOfControl
);
