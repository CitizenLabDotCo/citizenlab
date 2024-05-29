import React, { useState } from 'react';

import {
  Box,
  CheckboxWithLabel,
  colors,
  Text,
} from '@citizenlab/cl2-component-library';
import {
  ControlProps,
  isPrimitiveArrayControl,
  RankedTester,
  rankWith,
} from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { darken } from 'polished';
import styled from 'styled-components';

import { FormLabel } from 'components/UI/FormComponents';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';

import ErrorDisplay from '../ErrorDisplay';
import VerificationIcon from '../VerificationIcon';

import { getOptions, getSubtextElement } from './controlUtils';
import messages from './messages';

const StyledBox = styled(Box)`
  background-color: ${colors.grey100};
  &:hover {
    background-color: ${darken(0.05, colors.grey100)};
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
  const { formatMessage } = useIntl();
  const answerNotPublic = uischema.options?.answer_visible_to === 'admins';
  const options = getOptions(schema, 'multi');
  const dataArray = Array.isArray(data) ? data : [];

  const maxItems = schema.maxItems;
  const minItems = schema.minItems;

  if (!visible) {
    return null;
  }

  const getInstructionMessage = () => {
    if (!isNilOrError(minItems) && !isNilOrError(maxItems)) {
      if (minItems < 1 && maxItems === options?.length) {
        return formatMessage(messages.selectAsManyAsYouLike);
      }
      if (maxItems === minItems) {
        return formatMessage(messages.selectExactly, {
          selectExactly: maxItems,
        });
      }
      if (minItems !== maxItems) {
        return formatMessage(messages.selectBetween, {
          minItems,
          maxItems,
        });
      }
    }
    return null;
  };

  return (
    <>
      <FormLabel
        htmlFor={sanitizeForClassname(id)}
        labelValue={getLabel(uischema, schema, path)}
        optional={!required}
        subtextValue={getSubtextElement(uischema.options?.description)}
        subtextSupportsHtml
      />
      <Box display="block" id="e2e-multiselect-control">
        <Text mt="4px" mb={answerNotPublic ? '4px' : '8px'} fontSize="s">
          {getInstructionMessage()}
        </Text>
        {answerNotPublic && (
          <Text mt="0px" fontSize="s">
            <FormattedMessage {...messages.notPublic} />
          </Text>
        )}
        {options?.map((option) => (
          <StyledBox
            style={{ cursor: 'pointer' }}
            mb="12px"
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
              checkedColor={'tenantSecondary'}
              label={option.label}
              checked={dataArray.includes(option.value)}
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
