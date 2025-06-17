import React, { useState } from 'react';

import { Box, colors, Text, Radio } from '@citizenlab/cl2-component-library';
import {
  ControlProps,
  isOneOfControl,
  RankedTester,
  rankWith,
} from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { darken } from 'polished';
import styled, { useTheme } from 'styled-components';

import { FormLabel } from 'components/UI/FormComponents';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage } from 'utils/cl-intl';
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';

import ErrorDisplay from '../ErrorDisplay';
import VerificationIcon from '../VerificationIcon';

import { getOptions, getSubtextElement } from './controlUtils';
import messages from './messages';

const StyledBox = styled(Box)`
  cursor: pointer;
  background-color: ${colors.grey100};
  &:hover {
    background-color: ${darken(0.05, colors.grey100)};
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
  const answerNotPublic = uischema.options?.answer_visible_to === 'admins';

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
      {answerNotPublic && (
        <Text mt="0px" fontSize="s">
          <FormattedMessage {...messages.notPublic} />
        </Text>
      )}
      <Box
        display="block"
        id="e2e-single-select-control"
        onBlur={() => setDidBlur(true)}
        as="fieldset"
        border="none"
        p="0px"
      >
        <ScreenReaderOnly>
          <legend>{getLabel(uischema, schema, path)}</legend>
        </ScreenReaderOnly>
        {options?.map((option, index: number) => (
          <StyledBox mb="12px" key={option.value} borderRadius="3px">
            <Radio
              padding="20px 20px 4px 20px"
              marginTop="8px"
              buttonColor={theme.colors.tenantSecondary}
              id={`${path}-radio-${index}`}
              name={path}
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

export default withJsonFormsControlProps(SingleSelectRadioControl);

export const singleSelectRadioControlTester: RankedTester = rankWith(
  10,
  isOneOfControl
);
