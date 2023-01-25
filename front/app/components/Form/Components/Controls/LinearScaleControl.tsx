import React from 'react';

// JSON forms
import { withJsonFormsControlProps } from '@jsonforms/react';
import { ControlProps } from '@jsonforms/core';
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';

// Components
import {
  Box,
  Text,
  useBreakpoint,
  Button,
} from '@citizenlab/cl2-component-library';
import { FormLabel } from 'components/UI/FormComponents';
import VerificationIcon from '../VerificationIcon';
import ErrorDisplay from '../ErrorDisplay';

// style
import { colors } from 'utils/styleUtils';

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

  if (!visible) {
    return null;
  }

  return (
    <>
      <FormLabel
        htmlFor={sanitizeForClassname(id)}
        labelValue={getLabel(uischema, schema, path)}
        optional={!required}
        subtextValue={uischema.options?.description}
        subtextSupportsHtml
      />
      <Box data-testid="linearScaleControl">
        <Box gap="12px" display="flex" flexWrap="wrap">
          {[...Array(maximum).keys()].map((i) => {
            const rowId = `${path}-radio-${i}`;
            const visualIndex = i + 1;
            return (
              <Box flexGrow={1} key={rowId}>
                <Button
                  bgColor={
                    data === visualIndex ? colors.primary : colors.grey200
                  }
                  textHoverColor={
                    data === visualIndex ? 'white' : colors.textPrimary
                  }
                  textColor={
                    data === visualIndex ? 'white' : colors.textPrimary
                  }
                  width="100%"
                  onClick={() => handleChange(path, visualIndex)}
                >
                  {visualIndex}
                </Button>
              </Box>
            );
          })}
        </Box>
        <Box
          width="100%"
          display={isSmallerThanXlPhone ? 'block' : 'flex'}
          justifyContent="space-between"
        >
          {uischema.options?.minimum_label && (
            <Box mb={isSmallerThanXlPhone ? '12px' : '0'}>
              <Text color="textSecondary">
                {isSmallerThanXlPhone && <>1. </>}
                {uischema.options?.minimum_label}
              </Text>
            </Box>
          )}
          <Box>
            <Text color="textSecondary">
              {isSmallerThanXlPhone && <>{maximum}. </>}
              {uischema.options?.maximum_label}
            </Text>
          </Box>
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

// Old code:
{
  /* <>
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
</>; */
}
