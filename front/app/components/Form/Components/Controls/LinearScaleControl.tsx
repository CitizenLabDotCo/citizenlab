import React from 'react';

// JSON forms
import { withJsonFormsControlProps } from '@jsonforms/react';
import { ControlProps } from '@jsonforms/core';
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';

// Components
import {
  Box,
  Text,
  Radio,
  Label,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import { FormLabel } from 'components/UI/FormComponents';
import VerificationIcon from '../VerificationIcon';
import ErrorDisplay from '../ErrorDisplay';
import { getSubtextElement } from './controlUtils';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

const LinearScaleControl = ({
  data,
  path,
  errors,
  schema,
  uischema,
  required,
  handleChange,
  id,
  visible,
}: ControlProps) => {
  const isSmallerThanXlPhone = useBreakpoint('phone');
  const maximum = schema?.maximum;
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
        <Text mb="8px" mt="0px" fontSize="s">
          <FormattedMessage {...messages.notPublic} />
        </Text>
      )}
      <Box
        data-testid="linearScaleControl"
        display={isSmallerThanXlPhone ? 'block' : 'flex'}
        flexDirection="row"
        gap="16px"
        overflow="visible"
        flexWrap="nowrap"
        alignItems="flex-end"
        mb="4px"
      >
        {uischema.options?.minimum_label && (
          <Box mb={isSmallerThanXlPhone ? '12px' : '0'}>
            <Text
              mr="8px"
              mt="0"
              mb="0"
              color="textSecondary"
              textAlign={isSmallerThanXlPhone ? 'left' : 'right'}
            >
              {uischema.options?.minimum_label}
            </Text>
          </Box>
        )}
        <>
          {[...Array(maximum).keys()].map((i) => {
            const rowId = `${path}-radio-${i}`;
            const visualIndex = i + 1;
            return (
              <Box
                mb={isSmallerThanXlPhone ? '4px' : '0px'}
                display={isSmallerThanXlPhone ? 'flex' : 'block'}
                gap={isSmallerThanXlPhone ? '4px' : 'auto'}
                key={i}
                style={{ lineHeight: '0px' }}
              >
                <Box
                  mt="0"
                  mr="4px"
                  ml={isSmallerThanXlPhone ? '0px' : '5px'}
                  minHeight="24px"
                >
                  <Label htmlFor={rowId}>{visualIndex}</Label>
                </Box>
                {!isSmallerThanXlPhone && <br />}
                <Radio
                  name="linear_scale"
                  currentValue={data}
                  value={visualIndex}
                  key={i}
                  id={rowId}
                  onChange={(value) => handleChange(path, value)}
                />
              </Box>
            );
          })}
        </>
        <Box>
          <Text mr="8px" mt="0" mb="0" color="textSecondary">
            {uischema.options?.maximum_label}
          </Text>
        </Box>
        <VerificationIcon show={uischema?.options?.verificationLocked} />
      </Box>
      <ErrorDisplay ajvErrors={errors} fieldPath={path} didBlur={false} />
    </>
  );
};

export default withJsonFormsControlProps(LinearScaleControl);

export const linearScaleControlTester = (schema) => {
  if (schema?.options?.minimum_label?.length >= 0) {
    return 100;
  }
  return -1;
};
