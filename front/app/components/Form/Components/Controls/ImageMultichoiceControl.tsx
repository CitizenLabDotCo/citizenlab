import React, { useState } from 'react';

import {
  Box,
  CheckboxWithLabel,
  colors,
  Text,
  Image,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import { ControlProps } from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { darken } from 'polished';
import styled from 'styled-components';

import FullscreenImage from 'components/FullscreenImage';
import { FormLabel } from 'components/UI/FormComponents';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';

import ErrorDisplay from '../ErrorDisplay';
import VerificationIcon from '../VerificationIcon';

import { getOptions, getSubtextElement } from './controlUtils';
import imageFile from './emptyImage.png';
import messages from './messages';

const StyledBox = styled(Box)`
  background-color: ${colors.grey100};
  position: relative;
  flex: 1 1 auto;
  &:hover {
    background-color: ${darken(0.05, colors.grey100)};
  }
  cursor: pointer;
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
      <Box display="block" data-cy="e2e-image-multichoice-control">
        <Text mt="4px" mb={answerNotPublic ? '4px' : '8px'} fontSize="s">
          {getInstructionMessage()}
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
              <StyledBox
                mb="12px"
                key={option.value}
                borderRadius="3px"
                onBlur={() => {
                  setTimeout(() => {
                    setDidBlur(true);
                  }, 300);
                }}
                display="flex"
                flexDirection="column"
                alignItems="center"
                p="8px"
                border={
                  dataArray.includes(option.value)
                    ? `2px solid ${colors.primary}`
                    : undefined
                }
                onClick={onChange}
              >
                {option.value === 'other' ? (
                  <Image
                    width="100%"
                    src={option.image?.medium || imageFile}
                    alt={option.label}
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

                <Box
                  position="absolute"
                  top="18px"
                  right="12px"
                  onClick={(event) => {
                    event.stopPropagation();
                  }}
                >
                  <CheckboxWithLabel
                    size="20px"
                    checkedColor="tenantSecondary"
                    id={`${path}-checkbox-${index}`}
                    label=""
                    data-cy="e2e-image-multichoice-control-checkbox"
                    checked={dataArray.includes(option.value)}
                    onChange={onChange}
                  />
                </Box>
                <Box display="flex" w="100%" alignSelf="flex-start">
                  <Text my="12px" mx="4px">
                    {option.label}
                  </Text>
                </Box>
              </StyledBox>
            );
          })}
        </Box>
        <VerificationIcon show={uischema?.options?.verificationLocked} />
      </Box>
      <ErrorDisplay ajvErrors={errors} fieldPath={path} didBlur={didBlur} />
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
