import { withJsonFormsControlProps } from '@jsonforms/react';
import {
  ControlProps,
  isPrimitiveArrayControl,
  RankedTester,
  rankWith,
} from '@jsonforms/core';
import React, { useState } from 'react';

// utils
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';
import { getOptions } from './controlUtils';

// components
import VerificationIcon from '../VerificationIcon';
import { Box, Checkbox, colors, Text } from '@citizenlab/cl2-component-library';
import { FormLabel } from 'components/UI/FormComponents';
import ErrorDisplay from '../ErrorDisplay';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import { darken, transparentize } from 'polished';
import styled, { useTheme } from 'styled-components';

const StyledBox = styled(Box)<{ checkboxBackgroundColor: string }>`
  background-color: ${({ checkboxBackgroundColor }) =>
    checkboxBackgroundColor ? checkboxBackgroundColor : colors.grey200};
  &:hover {
    background-color: ${({ checkboxBackgroundColor }) =>
      checkboxBackgroundColor
        ? darken(0.05, checkboxBackgroundColor)
        : darken(0.05, colors.grey200)};
  }
`;

const MultiSelectCheckboxControl = ({
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
  const options = getOptions(schema, 'multi');
  const dataArray = Array.isArray(data) ? data : [];

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
      <Box display="block" id="e2e-multiselect-control">
        <Text mt="4px" mb="8px" fontSize="s">
          <FormattedMessage {...messages.selectMany} />
        </Text>
        {options?.map((option, index: number) => (
          <StyledBox
            style={{ cursor: 'pointer' }}
            mb="12px"
            key={option.value}
            checkboxBackgroundColor={colors.grey100}
          >
            <Checkbox
              containerPadding="16px 20px 16px 20px"
              checkedColor={theme.colors.tenantSecondary}
              id={`${path}-checkbox-${index}`}
              label={option.label}
              checked={dataArray.includes(option.value)}
              onChange={() => {
                if (dataArray.includes(option.value)) {
                  handleChange(
                    path,
                    dataArray.filter((value) => value !== option.value)
                  );
                } else {
                  handleChange(path, [...dataArray, option.value]);
                }
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

export default withJsonFormsControlProps(MultiSelectCheckboxControl);

export const multiSelectCheckboxControlTester: RankedTester = rankWith(
  10,
  isPrimitiveArrayControl
);
