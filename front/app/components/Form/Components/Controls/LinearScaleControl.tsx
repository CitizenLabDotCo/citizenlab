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
  const maximum = schema?.properties?.rating?.maximum;
  const minimumLabel = uischema.options?.minimum_label;
  return (
    <>
      <FormLabel
        htmlFor={sanitizeForClassname(id)}
        labelValue={getLabel(uischema, schema, path)}
        optional={!required}
        subtextValue={uischema.options?.description}
        subtextSupportsHtml
      />
      <Box display="flex" flexDirection="row" gap="8px" overflow="visible">
        <Box alignSelf="flex-end">
          <Text mr={minimumLabel ? '4px' : '0px'} fontWeight="bold">
            {minimumLabel}
          </Text>
        </Box>
        <>
          {[...Array(maximum)].map((x, i) => (
            <Box key={i} style={{ lineHeight: '0px' }}>
              <Box ml="4px" mt="16px">
                <Label htmlFor={`${x}-radio-${i}`}>{i + 1}</Label>
              </Box>
              <br />
              <Radio
                name="linear_scale"
                currentValue={data?.rating}
                value={i + 1}
                key={i}
                id={`${x}-radio-${i}`}
                onChange={(value) => handleChange(path, { rating: value })}
              />
            </Box>
          ))}
        </>
        <Box mt="28px" alignSelf="flex-end">
          <Text mr="8px" fontWeight="bold">
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
