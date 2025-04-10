import React, { useState } from 'react';

import { Box, IOption, Select } from '@citizenlab/cl2-component-library';
import {
  ControlProps,
  isEnumControl,
  JsonSchema,
  UISchemaElement,
} from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';
import styled from 'styled-components';

import dropdownLayoutTester from 'components/Form/utils/dropdownLayoutTester';
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

export default withJsonFormsControlProps(SingleSelectEnumControl);

export const SingleSelectEnumControlTester = (
  uiSchema: UISchemaElement,
  jsonSchema: JsonSchema
) => {
  if (
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    uiSchema?.options?.input_type === 'select' &&
    dropdownLayoutTester(uiSchema, jsonSchema, {
      rootSchema: jsonSchema,
      config: {},
    })
  ) {
    return 1000;
  } else if (
    isEnumControl(uiSchema, jsonSchema, {
      rootSchema: jsonSchema,
      config: {},
    })
  ) {
    return 4;
  }
  return -1;
};
