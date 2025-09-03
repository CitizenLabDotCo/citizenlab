import React, { useRef } from 'react';

import {
  Box,
  Text,
  useBreakpoint,
  Button,
  Icon,
} from '@citizenlab/cl2-component-library';
import { ControlProps } from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { UiSchema } from 'react-jsonschema-form';
import { useTheme } from 'styled-components';

import { FormLabel } from 'components/UI/FormComponents';

import { FormattedMessage } from 'utils/cl-intl';
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';

import ErrorDisplay from '../ErrorDisplay';

import { getSubtextElement } from './controlUtils';
import messages from './messages';

const RatingControl = ({
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

  const minimum = 1;
  const maximum = schema.maximum ?? 10;
  const answerNotPublic = uischema.options?.answer_visible_to === 'admins';
  const sliderRef = useRef<HTMLDivElement>(null);

  if (!visible) {
    return null;
  }

  const labelId = `${sanitizeForClassname(id)}-label`;
  const inputId = `${sanitizeForClassname(id)}-rating-input`;

  const getButtonWidth = () => {
    return isSmallerThanPhone
      ? `calc(100% / ${maximum > 5 ? 4 : maximum} - 8px)`
      : `calc(100% / ${maximum} - 8px)`;
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
    }
    event.preventDefault();
  };

  return (
    <>
      {/* Label now correctly references a hidden <input> */}
      <FormLabel
        id={labelId}
        htmlFor={inputId}
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

      {/* Hidden input to make the label valid */}
      <input type="hidden" id={inputId} value={data || minimum} readOnly />

      <Box
        data-testid="ratingControl"
        role="slider"
        ref={sliderRef}
        aria-valuemin={minimum}
        aria-valuemax={maximum}
        aria-valuenow={data || minimum}
        aria-labelledby={labelId}
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
              >
                <Button
                  py="12px"
                  id={`${inputId}-option-${visualIndex}`}
                  tabIndex={-1}
                  aria-pressed={data === visualIndex}
                  px="0"
                  width="100%"
                  onClick={() => handleChange(path, visualIndex)}
                  buttonStyle="text"
                >
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    gap="4px"
                  >
                    <Icon
                      name={data >= visualIndex ? 'ratingFilled' : 'rating'}
                      height="40px"
                      width="40px"
                      fill={
                        data >= visualIndex
                          ? theme.colors.tenantPrimary
                          : theme.colors.tenantPrimaryLighten75
                      }
                    />
                    {visualIndex}
                  </Box>
                </Button>
              </Box>
            );
          })}
        </Box>
      </Box>

      <ErrorDisplay
        inputId={inputId}
        ajvErrors={errors}
        fieldPath={path}
        didBlur={false}
      />
    </>
  );
};

export default withJsonFormsControlProps(RatingControl);

export const ratingControlTester = (schema: UiSchema) => {
  if (schema.options?.input_type === 'rating') {
    return 100;
  }
  return -1;
};
