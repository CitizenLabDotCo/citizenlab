import { withJsonFormsControlProps } from '@jsonforms/react';
import React, { useState } from 'react';
import styled from 'styled-components';
import { Box } from '@citizenlab/cl2-component-library';
import {
  ControlProps,
  optionIs,
  RankedTester,
  rankWith,
} from '@jsonforms/core';
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';
import { isString } from 'utils/helperUtils';
import { FormLabel } from 'components/UI/FormComponents';
import TextArea from 'components/UI/TextArea';
import ErrorDisplay from '../ErrorDisplay';
import VerificationIcon from '../VerificationIcon';

const StyledTextArea = styled(TextArea)`
  flex-grow: 1;
`;

const TextAreaControl = ({
  data,
  handleChange,
  path,
  errors,
  schema,
  id,
  required,
  uischema,
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
        <StyledTextArea
          onChange={(value) => handleChange(path, value)}
          rows={6}
          value={data}
          id={sanitizeForClassname(id)}
          onBlur={() => {
            uischema?.options?.transform === 'trim_on_blur' &&
              isString(data) &&
              handleChange(path, data.trim());
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

export default withJsonFormsControlProps(TextAreaControl);

export const textAreaControlTester: RankedTester = rankWith(
  10,
  optionIs('textarea', true)
);
