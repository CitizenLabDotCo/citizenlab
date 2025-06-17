import React, { useState } from 'react';

import {
  Box,
  CheckboxWithLabel,
  Text,
} from '@citizenlab/cl2-component-library';
import {
  ControlProps,
  isPrimitiveArrayControl,
  RankedTester,
  rankWith,
} from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';
import styled, { useTheme } from 'styled-components';

import { FormLabel } from 'components/UI/FormComponents';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';

import ErrorDisplay from '../ErrorDisplay';
import VerificationIcon from '../VerificationIcon';

import { getOptions, getSubtextElement } from './controlUtils';
import messages from './messages';
import { getInstructionMessage } from './utils';

const StyledBox = styled(Box)<{ hoverColor?: string }>`
  cursor: pointer;
  &:hover {
    background-color: ${({ hoverColor }) => hoverColor};
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
  const theme = useTheme();
  const [didBlur, setDidBlur] = useState(false);
  const { formatMessage } = useIntl();
  const answerNotPublic = uischema.options?.answer_visible_to === 'admins';
  const options = getOptions(schema, 'multi');
  const dataArray = Array.isArray(data) ? data : [];

  const maxItems = schema.maxItems;
  const minItems = schema.minItems;

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
      <Box
        display="block"
        id="e2e-multiselect-control"
        as="fieldset"
        border="none"
        p="0px"
      >
        <ScreenReaderOnly>
          <legend>{getLabel(uischema, schema, path)}</legend>
        </ScreenReaderOnly>
        <Text mt="4px" mb={answerNotPublic ? '4px' : '8px'} fontSize="s">
          {getInstructionMessage({
            minItems,
            maxItems,
            formatMessage,
            options,
          })}
        </Text>
        {answerNotPublic && (
          <Text mt="0px" fontSize="s">
            <FormattedMessage {...messages.notPublic} />
          </Text>
        )}
        {options?.map((option) => (
          <StyledBox
            hoverColor={theme.colors.tenantPrimaryLighten75}
            style={{ cursor: 'pointer' }}
            mb="12px"
            border={
              dataArray.includes(option.value)
                ? `2px solid ${theme.colors.tenantPrimary}`
                : `1px solid ${theme.colors.tenantPrimary}`
            }
            background={theme.colors.tenantPrimaryLighten95}
            key={option.value}
            borderRadius="3px"
            onBlur={() => {
              setTimeout(() => {
                setDidBlur(true);
              }, 300);
            }}
          >
            <CheckboxWithLabel
              size="20px"
              padding="18px 20px 18px 20px"
              checkedColor={'tenantPrimary'}
              label={
                <Text m="0px" color={'tenantPrimary'}>
                  {option.label}
                </Text>
              }
              checked={dataArray.includes(option.value)}
              usePrimaryBorder={true}
              onChange={() => {
                if (dataArray.includes(option.value)) {
                  dataArray.length === 1
                    ? handleChange(path, undefined)
                    : handleChange(
                        path,
                        dataArray.filter((value) => value !== option.value)
                      );
                } else {
                  handleChange(path, [...dataArray, option.value]);
                }
              }}
            />
          </StyledBox>
        ))}
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

export default withJsonFormsControlProps(MultiSelectCheckboxControl);

export const multiSelectCheckboxControlTester: RankedTester = rankWith(
  10,
  isPrimitiveArrayControl
);
