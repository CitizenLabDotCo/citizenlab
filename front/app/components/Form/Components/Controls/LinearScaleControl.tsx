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
import { getSubtextElement } from './controlUtils';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import { colors } from 'utils/styleUtils';
import { useTheme } from 'styled-components';

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
  const theme = useTheme();
  const maximum = schema?.maximum;
  const answerNotPublic = uischema.options?.answer_visible_to === 'admins';

  if (!visible) {
    return null;
  }

  const getButtonWidth = () => {
    if (maximum && maximum > 5) {
      return maximum > 6 ? '64px' : '80px';
    }
    return 'auto';
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
      {answerNotPublic && (
        <Text mb="8px" mt="0px" fontSize="s">
          <FormattedMessage {...messages.notPublic} />
        </Text>
      )}
      <Box data-testid="linearScaleControl">
        <Box
          gap={isSmallerThanXlPhone ? '8px' : '12px'}
          display="flex"
          flexWrap="wrap"
          justifyContent="center"
        >
          {[...Array(maximum).keys()].map((i) => {
            const rowId = `${path}-radio-${i}`;
            const visualIndex = i + 1;
            return (
              <Box
                flexGrow={
                  isSmallerThanXlPhone && maximum && maximum > 5 ? 0 : 1
                }
                key={rowId}
                minWidth={getButtonWidth()}
                padding="16px, 20px, 16px, 20px"
              >
                <Button
                  py="12px"
                  id={`linear-scale-option-${visualIndex}`}
                  bgColor={
                    data === visualIndex
                      ? theme.colors.tenantSecondary
                      : colors.grey100
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
            <Box maxWidth={isSmallerThanXlPhone ? '100%' : '50%'}>
              <Text
                mt="8px"
                mb="0px"
                color="textSecondary"
                fontSize={isSmallerThanXlPhone ? 's' : 'm'}
              >
                {isSmallerThanXlPhone && <>1. </>}
                {uischema.options?.minimum_label}
              </Text>
            </Box>
          )}
          {uischema.options?.maximum_label && (
            <Box maxWidth={isSmallerThanXlPhone ? '100%' : '50%'}>
              <Text
                mt={isSmallerThanXlPhone ? '0px' : '8px'}
                m="0px"
                color="textSecondary"
                fontSize={isSmallerThanXlPhone ? 's' : 'm'}
              >
                {isSmallerThanXlPhone && <>{maximum}. </>}
                {uischema.options?.maximum_label}
              </Text>
            </Box>
          )}
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
