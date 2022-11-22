import React from 'react';

// JSON forms
import { ControlProps } from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';
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
import ErrorDisplay from '../ErrorDisplay';
import VerificationIcon from '../VerificationIcon';

const LinearScaleControl = ({
  data,
  path,
  errors,
  schema,
  uischema,
  required,
  handleChange,
  id,
}: ControlProps) => {
  const isSmallerThanXlPhone = useBreakpoint('phone');
  const maximum = schema?.maximum;

  return (
    <>
      <FormLabel
        htmlFor={sanitizeForClassname(id)}
        labelValue={getLabel(uischema, schema, path)}
        optional={!required}
        subtextValue={uischema.options?.description}
        subtextSupportsHtml
      />
      <Box
        data-testid="linearScaleControl"
        display={isSmallerThanXlPhone ? 'block' : 'flex'}
        flexDirection="row"
        gap="16px"
        overflow="visible"
        flexWrap="wrap"
      >
        {uischema.options?.minimum_label && (
          <Box
            pt={isSmallerThanXlPhone ? '0px' : '28px'}
            mb={'0px'}
            alignSelf="center"
          >
            <Text
              mr="8px"
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
                  mt={isSmallerThanXlPhone ? '0px' : '16px'}
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
        <Box pt={isSmallerThanXlPhone ? '4px' : '28px'} alignSelf="center">
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
