import React, { useEffect, useRef, useCallback } from 'react';

import {
  Box,
  Button,
  Table,
  Td,
  Text,
  Th,
  Tr,
} from '@citizenlab/cl2-component-library';
import { ControlProps } from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { UiSchema } from 'react-jsonschema-form';

import { FormLabel } from 'components/UI/FormComponents';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';

import ErrorDisplay from '../../ErrorDisplay';
import VerificationIcon from '../../VerificationIcon';
import { getSubtextElement } from '../controlUtils';
import messages from '../messages';

import {
  getAriaValueText,
  getClassNameSentimentImage,
  getSentimentEmoji,
  handleKeyboardKeyChange,
  StyledImg,
} from './utils';

const SentimentLinearScaleControl = ({
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
  const { formatMessage } = useIntl();

  const minimum = 1;
  const maximum = 5;

  const answerNotPublic = uischema.options?.answer_visible_to === 'admins';

  const sliderRef = useRef<HTMLDivElement>(null);

  // Put all labels from the UI Schema in an array so we can easily access them
  const labelsFromSchema = Array.from({ length: maximum }, (_, index) => {
    return uischema.options?.[`linear_scale_label${index + 1}`];
  });

  // Get the aria-label for the slider
  const getAriaLabel = useCallback(
    (value: number, total: number) => {
      return getAriaValueText({
        value,
        total,
        uischema,
        formatMessage,
      });
    },
    [uischema, formatMessage]
  );

  // Set the aria-valuenow and aria-valuetext attributes on the slider when the data changes
  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.setAttribute('aria-valuenow', String(data || minimum));
      sliderRef.current.setAttribute(
        'aria-valuetext',
        getAriaLabel(data || minimum, maximum)
      );
    }
  }, [data, getAriaLabel, minimum, maximum]);

  // Handle keyboard input for the slider
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const value = data || minimum;
    let newValue = value;
    newValue = handleKeyboardKeyChange(event, value);

    handleChange(path, newValue);
    if (sliderRef.current) {
      sliderRef.current.setAttribute('aria-valuenow', String(newValue));
      sliderRef.current.setAttribute(
        'aria-valuetext',
        getAriaLabel(newValue, 5)
      );
    }
    event.preventDefault();
  };

  // If the control is not visible, don't render anything
  if (!visible) {
    return null;
  }

  return (
    <>
      <FormLabel
        id={sanitizeForClassname(id)}
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
        data-testid="sentimentLinearScaleControl"
        role="slider"
        ref={sliderRef}
        aria-valuemin={minimum}
        aria-valuemax={maximum}
        aria-labelledby={sanitizeForClassname(id)}
        onKeyDown={(event) => {
          if (event.key !== 'Tab') {
            // Don't override the default tab behaviour
            handleKeyDown(event);
          }
        }}
        tabIndex={0}
      >
        <Box>
          <Table style={{ tableLayout: 'fixed' }}>
            <Tr>
              {[...Array(maximum).keys()].map((i) => {
                const visualIndex = i + 1;
                return (
                  <Th
                    p="0px"
                    maxWidth="20%"
                    key={`${path}-radio-${visualIndex}`}
                    scope="col"
                    tabIndex={-1}
                  >
                    <Text
                      textAlign="center"
                      m="0px"
                      px="4px"
                      color="grey700"
                      style={{ wordWrap: 'break-word' }}
                    >
                      {labelsFromSchema[visualIndex - 1]}
                      <ScreenReaderOnly>
                        {labelsFromSchema[visualIndex - 1]
                          ? labelsFromSchema[visualIndex - 1]
                          : getAriaLabel(visualIndex, maximum)}
                      </ScreenReaderOnly>
                    </Text>
                  </Th>
                );
              })}
            </Tr>
            <Tr>
              {[...Array(maximum).keys()].map((i) => {
                const visualIndex = i + 1;
                return (
                  <Td pt="4px" key={`${path}-radio-${visualIndex}`}>
                    <Box
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                    >
                      <Button
                        p="0px"
                        m="0px"
                        id={`${path}-linear-scale-option-${visualIndex}`}
                        aria-pressed={data === visualIndex}
                        width="100%"
                        tabIndex={-1}
                        onClick={() => {
                          if (data === visualIndex) {
                            // Clear data from this question and any follow-up question
                            handleChange(path, undefined);
                            handleChange(`${path}_follow_up`, undefined);
                          } else {
                            handleChange(path, visualIndex);
                          }
                        }}
                        buttonStyle="text"
                      >
                        <ScreenReaderOnly>
                          {getAriaLabel(visualIndex, maximum)}
                        </ScreenReaderOnly>
                        <StyledImg
                          src={getSentimentEmoji(visualIndex)}
                          alt=""
                          aria-hidden
                          className={getClassNameSentimentImage(
                            data,
                            visualIndex
                          )}
                        />
                      </Button>
                    </Box>
                  </Td>
                );
              })}
            </Tr>
          </Table>
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

export default withJsonFormsControlProps(SentimentLinearScaleControl);

export const sentimentLinearScaleControlTester = (schema: UiSchema) => {
  if (schema.options?.input_type === 'sentiment_linear_scale') {
    return 200;
  }
  return -1;
};
