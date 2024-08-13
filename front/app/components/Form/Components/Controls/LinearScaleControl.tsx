import React, { useEffect, useRef, useCallback } from 'react';

import {
  Box,
  Text,
  useBreakpoint,
  Button,
  colors,
} from '@citizenlab/cl2-component-library';
import { ControlProps } from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { useTheme } from 'styled-components';

import { FormLabel } from 'components/UI/FormComponents';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';

import ErrorDisplay from '../ErrorDisplay';
import VerificationIcon from '../VerificationIcon';

import { getSubtextElement } from './controlUtils';
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
  const isSmallerThanPhone = useBreakpoint('phone');
  const theme = useTheme();
  const { formatMessage } = useIntl();

  const minimum = 1;
  const maximum = schema?.maximum ?? 7; // Seven since the maximum number of options is 7
  const answerNotPublic = uischema.options?.answer_visible_to === 'admins';
  const sliderRef = useRef<HTMLDivElement>(null);

  const getValueText = useCallback(
    (value: number, total: number) => {
      if (value === minimum && uischema?.options?.minimum_label) {
        return formatMessage(messages.valueOutOfTotalWithLabel, {
          value,
          total,
          label: uischema.options.minimum_label,
        });
      }
      if (value === maximum && uischema?.options?.maximum_label) {
        return formatMessage(messages.valueOutOfTotalWithLabel, {
          value,
          total,
          label: uischema.options.maximum_label,
        });
      }
      if (uischema?.options?.maximum_label) {
        return formatMessage(messages.valueOutOfTotalWithMaxExplanation, {
          value,
          total,
          maxValue: maximum,
          maxLabel: uischema.options.maximum_label,
        });
      }
      return formatMessage(messages.valueOutOfTotal, { value, total });
    },
    [minimum, maximum, uischema?.options, formatMessage]
  );

  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.setAttribute('aria-valuenow', String(data || minimum));
      sliderRef.current.setAttribute(
        'aria-valuetext',
        getValueText(data || minimum, maximum)
      );
    }
  }, [data, getValueText, minimum, maximum]);

  if (!visible) {
    return null;
  }

  const getButtonWidth = () => {
    if (maximum > 5) {
      return maximum > 6 ? '64px' : '80px';
    }
    return 'auto';
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const value = data || minimum;
    let newValue = value;

    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        newValue = Math.max(minimum, value - 1);
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        newValue = Math.min(maximum, value + 1);
        break;
      case 'Home':
        newValue = minimum;
        break;
      case 'End':
        newValue = maximum;
        break;
      default:
        return;
    }

    handleChange(path, newValue);
    if (sliderRef.current) {
      sliderRef.current.setAttribute('aria-valuenow', String(newValue));
      sliderRef.current.setAttribute(
        'aria-valuetext',
        getValueText(newValue, maximum)
      );
    }
    event.preventDefault();
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
      <Box
        data-testid="linearScaleControl"
        role="slider"
        ref={sliderRef}
        aria-valuemin={minimum}
        aria-valuemax={maximum}
        aria-labelledby={sanitizeForClassname(id)}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <Box
          gap={isSmallerThanPhone ? '8px' : '12px'}
          display="flex"
          flexWrap="wrap"
          justifyContent="center"
        >
          {[...Array(maximum).keys()].map((i) => {
            const visualIndex = i + 1;
            return (
              <Box
                flexGrow={isSmallerThanPhone && maximum && maximum > 5 ? 0 : 1}
                key={`${path}-radio-${visualIndex}`}
                minWidth={getButtonWidth()}
                padding="16px, 20px, 16px, 20px"
              >
                <Button
                  py="12px"
                  id={`linear-scale-option-${visualIndex}`}
                  tabIndex={-1}
                  aria-pressed={data === visualIndex}
                  borderColor={theme.colors.tenantPrimary}
                  borderHoverColor={theme.colors.tenantPrimary}
                  bgColor={
                    data === visualIndex
                      ? theme.colors.tenantPrimary
                      : theme.colors.tenantPrimaryLighten95
                  }
                  bgHoverColor={
                    data === visualIndex
                      ? theme.colors.tenantPrimary
                      : theme.colors.tenantPrimaryLighten75
                  }
                  textHoverColor={
                    data === visualIndex
                      ? colors.white
                      : theme.colors.tenantPrimary
                  }
                  textColor={
                    data === visualIndex
                      ? colors.white
                      : theme.colors.tenantPrimary
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
          display={isSmallerThanPhone ? 'block' : 'flex'}
          justifyContent="space-between"
        >
          {uischema.options?.minimum_label && (
            <Box maxWidth={isSmallerThanPhone ? '100%' : '50%'}>
              <Text
                mt="8px"
                mb="0px"
                color="textSecondary"
                fontSize={isSmallerThanPhone ? 's' : 'm'}
              >
                {isSmallerThanPhone && <>1. </>}
                {uischema.options?.minimum_label}
              </Text>
            </Box>
          )}
          {uischema.options?.maximum_label && (
            <Box maxWidth={isSmallerThanPhone ? '100%' : '50%'}>
              <Text
                mt={isSmallerThanPhone ? '0px' : '8px'}
                m="0px"
                color="textSecondary"
                fontSize={isSmallerThanPhone ? 's' : 'm'}
              >
                {isSmallerThanPhone && <>{maximum}. </>}
                {uischema.options?.maximum_label}
              </Text>
            </Box>
          )}
        </Box>
        <VerificationIcon show={uischema?.options?.verificationLocked} />
      </Box>
      <ErrorDisplay
        inputId={sanitizeForClassname(id)}
        ajvErrors={errors}
        fieldPath={path}
        didBlur={false}
      />
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
