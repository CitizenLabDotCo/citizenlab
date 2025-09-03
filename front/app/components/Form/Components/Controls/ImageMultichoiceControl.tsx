import React, { useState } from 'react';

import {
  Box,
  Text,
  Image,
  useBreakpoint,
  Checkbox,
} from '@citizenlab/cl2-component-library';
import { ControlProps } from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';
import styled, { useTheme } from 'styled-components';

import { FormLabel } from 'components/UI/FormComponents';
import FullscreenImage from 'components/UI/FullscreenImage';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';

import ErrorDisplay from '../ErrorDisplay';
import VerificationIcon from '../VerificationIcon';

import { getOptions, getSubtextElement } from './controlUtils';
import imageFile from './emptyImage.png';
import messages from './messages';
import { getInstructionMessage } from './utils';

const HoverBox = styled(Box)<{ hoverColor: string }>`
  cursor: pointer;
  &:hover {
    background-color: ${({ hoverColor }) => hoverColor};
  }
`;

const ImageMultichoiceControl = ({
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
  const isSmallerThanPhone = useBreakpoint('phone');

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
      <Box display="block" data-cy="e2e-image-multichoice-control">
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
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: isSmallerThanPhone ? '1fr' : 'repeat(2, 50%)',
            gap: '16px',
            width: '100%',
            justifyContent: 'center',
          }}
        >
          {options?.map((option, index: number) => {
            const onChange = () => {
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
            };
            return (
              <HoverBox
                key={option.value}
                borderRadius="3px"
                bgColor={theme.colors.tenantPrimaryLighten95}
                border={
                  dataArray.includes(option.value)
                    ? `2px solid ${theme.colors.tenantPrimary}`
                    : `1px solid ${theme.colors.tenantPrimary}`
                }
                hoverColor={theme.colors.tenantPrimaryLighten75}
              >
                <Box
                  as="label"
                  htmlFor={`${path}-checkbox-${index}`}
                  style={{ cursor: 'pointer' }}
                >
                  <Box
                    onBlur={() => {
                      setTimeout(() => {
                        setDidBlur(true);
                      }, 300);
                    }}
                    p="16px"
                    pb="0"
                  >
                    {option.value === 'other' ? (
                      <Image
                        width="100%"
                        src={option.image?.medium || imageFile}
                        alt=""
                        style={{ borderRadius: '3px 3px 0 0' }}
                      />
                    ) : (
                      <Box minHeight="200px">
                        <FullscreenImage
                          src={option.image?.large || imageFile}
                          altText={option.label}
                        />
                      </Box>
                    )}
                  </Box>
                  <Box display="flex" alignItems="flex-start" p="16px">
                    <Checkbox
                      checkedColor="tenantPrimary"
                      usePrimaryBorder={true}
                      id={`${path}-checkbox-${index}`}
                      data-cy="e2e-image-multichoice-control-checkbox"
                      checked={dataArray.includes(option.value)}
                      onChange={onChange}
                      mr="8px"
                    />
                    <Text color="tenantPrimary" m="0">
                      {option.label}
                    </Text>
                  </Box>
                </Box>
              </HoverBox>
            );
          })}
        </Box>
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

export default withJsonFormsControlProps(ImageMultichoiceControl);

export const imageMultichoiceControlTester = (uischema) => {
  if (uischema?.options?.input_type === 'multiselect_image') {
    return 1000;
  }
  return -1;
};
