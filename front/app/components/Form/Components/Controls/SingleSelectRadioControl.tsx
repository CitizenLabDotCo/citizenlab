import { withJsonFormsControlProps } from '@jsonforms/react';
import {
  ControlProps,
  isOneOfControl,
  RankedTester,
  rankWith,
} from '@jsonforms/core';
import React, { useState } from 'react';

// components
import ErrorDisplay from '../ErrorDisplay';
import { Box, colors, Text, Radio } from '@citizenlab/cl2-component-library';
import { FormLabel } from 'components/UI/FormComponents';
import VerificationIcon from '../VerificationIcon';

// utils
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';
import { getOptions } from './controlUtils';

// style
import { darken } from 'polished';
import styled, { useTheme } from 'styled-components';

const StyledBox = styled(Box)<{ selectBackgroundColor: string }>`
  cursor: pointer;
  background-color: ${({ selectBackgroundColor }) =>
    selectBackgroundColor ? selectBackgroundColor : colors.grey200};
  &:hover {
    background-color: ${({ selectBackgroundColor }) =>
      selectBackgroundColor
        ? darken(0.05, selectBackgroundColor)
        : darken(0.05, colors.grey200)};
  }
`;

const SingleSelectRadioControl = ({
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
  const theme = useTheme();
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
        subtextValue={uischema.options?.description}
        subtextSupportsHtml
      />
      <Box display="block" id="e2e-single-select-control">
        {options?.map((option, index: number) => (
          <StyledBox
            selectBackgroundColor={colors.grey100}
            mb="12px"
            key={option.value}
          >
            <Radio
              padding="20px 20px 4px 20px"
              marginTop="8px"
              buttonColor={theme.colors.tenantSecondary}
              id={`${path}-radio-${index}`}
              name="name-temp"
              label={
                <Text p="0px" m="0px" fontSize="s">
                  {option.label}
                </Text>
              }
              currentValue={data}
              value={option.value}
              onChange={() => {
                handleChange(path, option.value);
                setDidBlur(true);
              }}
            />
          </StyledBox>
        ))}
        <VerificationIcon show={uischema?.options?.verificationLocked} />
      </Box>
      <ErrorDisplay ajvErrors={errors} fieldPath={path} didBlur={didBlur} />
    </>
  );
};

export default withJsonFormsControlProps(SingleSelectRadioControl);

export const singleSelectRadioControlTester: RankedTester = rankWith(
  10,
  isOneOfControl
);
