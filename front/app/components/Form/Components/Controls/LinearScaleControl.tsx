import React, { useEffect, useRef, useCallback } from 'react';

import {
  Box,
  Text,
  useBreakpoint,
  Button,
  colors,
} from '@citizenlab/cl2-component-library';
import { ControlProps, UISchemaElement } from '@jsonforms/core';
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
  const maximum = schema.maximum ?? 11; // Seven since the maximum number of options is 11
  const answerNotPublic = uischema.options?.answer_visible_to === 'admins';
  const sliderRef = useRef<HTMLDivElement>(null);

  const getAriaValueText = useCallback(
    (value: number, total: number) => {
      // If the value has a label, read it out
      if (uischema.options?.[`linear_scale_label${value}`]) {
        return formatMessage(messages.valueOutOfTotalWithLabel, {
          value,
          total,
          label: uischema.options[`linear_scale_label${value}`],
        });
      }
      // If we don't have a label but we do have a maximum, read out the current value & maximum label
      else if (uischema.options?.[`linear_scale_label${maximum}`]) {
        return formatMessage(messages.valueOutOfTotalWithMaxExplanation, {
          value,
          total,
          maxValue: maximum,
          maxLabel: uischema.options[`linear_scale_label${maximum}`],
        });
      }
      // Otherwise, just read out the value and the maximum value
      return formatMessage(messages.valueOutOfTotal, { value, total });
    },
    [maximum, uischema.options, formatMessage]
  );

  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.setAttribute('aria-valuenow', String(data || minimum));
      sliderRef.current.setAttribute(
        'aria-valuetext',
        getAriaValueText(data || minimum, maximum)
      );
    }
  }, [data, getAriaValueText, minimum, maximum]);

  if (!visible) {
    return null;
  }

  const getButtonWidth = () => {
    if (isSmallerThanPhone) {
      return `calc(100% / ${maximum > 5 ? 4 : maximum} - 8px)`; // Fit 4 buttons per row on small screens
    }
    return `calc(100% / ${maximum} - 8px)`; // Fit all buttons on one row for larger screens
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
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
        getAriaValueText(newValue, maximum)
      );
    }
    event.preventDefault();
  };

  // Put all labels from the UI Schema in an array so we can easily access them
  const labelsFromSchema = Array.from({ length: maximum }, (_, index) => {
    return uischema.options?.[`linear_scale_label${index + 1}`];
  });

  // Get an array of the middle value labels so we can determine how to show them in the UI
  const middleValueLabels = labelsFromSchema.slice(1, -1); // Get only the middle values
  const hasOnlyMinOrMaxLabels = middleValueLabels.every((label) => !label); // There should be no middle value labels

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
          gap={isSmallerThanPhone ? '4px' : '8px'}
          display="flex"
          flexWrap="wrap"
          justifyContent="center"
        >
          {[...Array(maximum).keys()].map((i) => {
            const visualIndex = i + 1;
            return (
              <Box
                flexBasis={100 / maximum}
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
          {hasOnlyMinOrMaxLabels && !isSmallerThanPhone ? ( // For desktop view when only min and/or max labels are present
            <>
              <Box maxWidth={'50%'}>
                <Text mt="8px" mb="0px" color="textSecondary">
                  {labelsFromSchema[0]}
                </Text>
              </Box>
              <Box maxWidth={'50%'}>
                <Text mt={'8px'} m="0px" color="textSecondary">
                  {labelsFromSchema[labelsFromSchema.length - 1]}
                </Text>
              </Box>
            </>
          ) : (
            // Show labels as list underneath the buttons when more than 3 labels OR on mobile devices
            <Box maxWidth={'100%'}>
              {labelsFromSchema.map((label, index) => (
                <Box display="flex" key={`${path}-${index}`}>
                  {label && (
                    <>
                      <Text
                        mt="8px"
                        mb="0px"
                        mr="8px"
                        color="textSecondary"
                        style={{ textAlign: 'center' }}
                      >
                        {`${index + 1}.`}
                      </Text>
                      <Text
                        mt="8px"
                        mb="0px"
                        color="textSecondary"
                        style={{ textAlign: 'center' }}
                      >
                        {label}
                      </Text>
                    </>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </Box>
        <VerificationIcon show={uischema.options?.verificationLocked} />
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

export const linearScaleControlTester = (schema: UISchemaElement) => {
  if (schema.options?.linear_scale_label1?.length >= 0) {
    return 100;
  }
  return -1;
};
