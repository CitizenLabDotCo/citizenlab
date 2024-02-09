import { withJsonFormsControlProps } from '@jsonforms/react';
import { ControlProps } from '@jsonforms/core';
import React, { useState } from 'react';

// utils
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';
import { getOptions, getSubtextElement } from './controlUtils';
import imageFile from './emptyImage.png';

// components
import VerificationIcon from '../VerificationIcon';
import {
  Box,
  Checkbox,
  colors,
  Text,
  Image,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import { FormLabel } from 'components/UI/FormComponents';
import ErrorDisplay from '../ErrorDisplay';

// i18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from './messages';

// style
import { darken } from 'polished';
import styled from 'styled-components';
import { isNilOrError } from 'utils/helperUtils';

const StyledBox = styled(Box)`
  background-color: ${colors.grey100};
  &:hover {
    background-color: ${darken(0.05, colors.grey100)};
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
          display="flex"
          flexWrap="wrap"
          gap="16px"
          w="100%"
          justifyContent={isSmallerThanPhone ? 'center' : 'flex-start'}
          alignItems="center"
        >
          {options?.map((option, index: number) => (
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
              display="flex"
              flexDirection="column"
              alignItems="stretch"
            >
              <Image
                width="188px"
                src={option.image?.medium || imageFile}
                alt={option.label}
              />
              <Checkbox
                size="20px"
                padding="18px 20px 18px 20px"
                checkedColor={'tenantSecondary'}
                id={`${path}-checkbox-${index}`}
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
