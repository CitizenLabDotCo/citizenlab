import React, { useState } from 'react';

import { Box, Text, Radio } from '@citizenlab/cl2-component-library';
import {
  ControlProps,
  isEnumControl,
  RankedTester,
  rankWith,
} from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';
import styled, { useTheme } from 'styled-components';

import { FormLabel } from 'components/UI/FormComponents';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage } from 'utils/cl-intl';
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';

import ErrorDisplay from '../ErrorDisplay';
import VerificationIcon from '../VerificationIcon';

import { getOptions, getSubtextElement } from './controlUtils';
import messages from './messages';

const StyledBox = styled(Box)<{ hoverColor: string }>`
  cursor: pointer;
  &:hover {
    background-color: ${({ hoverColor }) => hoverColor};
  }
`;

const SingleSelectRadioEnumControl = ({
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
  const options = getOptions(schema, 'singleEnum', uischema);
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
          <StyledBox
            background={theme.colors.tenantPrimaryLighten95}
            hoverColor={theme.colors.tenantPrimaryLighten75}
            border={
              data === option.value
                ? `2px solid ${theme.colors.tenantPrimary}`
                : `1px solid ${theme.colors.tenantPrimary}`
            }
            mb="12px"
            key={option.value}
            borderRadius="3px"
          >
            <Radio
              padding="20px"
              buttonColor={theme.colors.tenantPrimary}
              usePrimaryBorder={true}
              id={`${path}-radio-${index}`}
              name={path}
              label={
                // TODO: Find better solution for styling the Radio label. Requires small offset for alignment.
                <Text color={'tenantPrimary'} p="0px" m="0px" mt="-1px">
                  {option.label}
                </Text>
              }
              currentValue={data}
              value={option.value}
              onChange={() => {
                if (option.value !== data) {
                  handleChange(path, option.value);
                } else {
                  // User is trying to unselect the option
                  handleChange(path, undefined);
                }
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

export default withJsonFormsControlProps(SingleSelectRadioEnumControl);

export const singleSelectRadioEnumControlTester: RankedTester = rankWith(
  10,
  isEnumControl
);
