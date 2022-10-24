import React from 'react';

// JSON forms
import { withJsonFormsControlProps } from '@jsonforms/react';
import { ControlProps } from '@jsonforms/core';
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';

// Components
import { Box, Text, Radio, Label } from '@citizenlab/cl2-component-library';
import { FormLabel } from 'components/UI/FormComponents';
import VerificationIcon from '../VerificationIcon';
import ErrorDisplay from '../ErrorDisplay';

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
        display="flex"
        flexDirection="row"
        gap="16px"
        overflow="visible"
        flexWrap="wrap"
      >
        {uischema.options?.minimum_label && (
          <Box pt="28px" alignSelf="center">
            <Text
              mr="8px"
              mt="0"
              mb="0"
              color="textSecondary"
              textAlign="right"
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
              <Box key={i} style={{ lineHeight: '0px' }}>
                <Box mt="16px" mx="4px" minHeight="24px">
                  <Label htmlFor={rowId}>{visualIndex}</Label>
                </Box>
                <br />
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
        <Box pt="28px" alignSelf="center">
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
