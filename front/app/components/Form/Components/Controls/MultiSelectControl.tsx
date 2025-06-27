import React, { useState } from 'react';

import { Box, Text, useBreakpoint } from '@citizenlab/cl2-component-library';
import {
  ControlProps,
  isPrimitiveArrayControl,
  JsonSchema,
  UISchemaElement,
} from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';
import styled from 'styled-components';

import dropdownLayoutTester from 'components/Form/utils/dropdownLayoutTester';
import { FormLabel } from 'components/UI/FormComponents';
import MultipleSelect from 'components/UI/MultipleSelect';

import { useIntl } from 'utils/cl-intl';
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';

import ErrorDisplay from '../ErrorDisplay';
import VerificationIcon from '../VerificationIcon';

import { getOptions, getSubtextElement } from './controlUtils';
import { getInstructionMessage } from './utils';

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
  const { formatMessage } = useIntl();
  const [didBlur, setDidBlur] = useState(false);
  const options = getOptions(schema, 'multi');
  const isSmallerThanPhone = useBreakpoint('phone');

  if (!visible) {
    return null;
  }

  const maxItems = schema.maxItems;
  const minItems = schema.minItems;

  return (
    <>
      <FormLabel
        htmlFor={sanitizeForClassname(id)}
        labelValue={getLabel(uischema, schema, path)}
        optional={!required}
        subtextValue={getSubtextElement(uischema.options?.description)}
        subtextSupportsHtml
      />
      <Text mt="4px" mb={'4px'} fontSize="s">
        {getInstructionMessage({ minItems, maxItems, formatMessage, options })}
      </Text>
      <Box display="flex" flexDirection="row" overflow="visible">
        <Box flexGrow={1}>
          <StyledMultipleSelect
            value={data}
            options={options}
            onChange={(vals) => {
              setDidBlur(true);
              if (vals.length === 0) {
                handleChange(path, undefined);
              } else {
                handleChange(
                  path,
                  vals.map((val) => val.value)
                );
              }
            }}
            inputId={sanitizeForClassname(id)}
            disabled={uischema.options?.readonly}
            // On phones, the keyboard that appears is too large
            // and covers the options. So we disable the search functionality
            isSearchable={!isSmallerThanPhone}
          />
        </Box>

        <VerificationIcon show={uischema.options?.verificationLocked} />
      </Box>
      <Box mt="4px">
        <ErrorDisplay
          inputId={sanitizeForClassname(id)}
          ajvErrors={errors}
          fieldPath={path}
          didBlur={didBlur}
        />
      </Box>
    </>
  );
};

export default withJsonFormsControlProps(MultiSelectControl);

export const multiSelectControlTester = (
  uiSchema: UISchemaElement,
  jsonSchema: JsonSchema
) => {
  if (
    uiSchema.options?.input_type === 'multiselect' &&
    dropdownLayoutTester(uiSchema, jsonSchema, {
      rootSchema: jsonSchema,
      config: {},
    })
  ) {
    return 1000;
  } else if (
    isPrimitiveArrayControl(uiSchema, jsonSchema, {
      rootSchema: jsonSchema,
      config: {},
    })
  ) {
    return 4;
  }
  return -1;
};
