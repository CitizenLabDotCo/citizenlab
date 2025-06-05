import React, { useEffect, useRef, useCallback } from 'react';

import {
  Box,
  Button,
  Icon,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@citizenlab/cl2-component-library';
import { ControlProps } from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { UiSchema } from 'react-jsonschema-form';
import { useTheme } from 'styled-components';

import { FormLabel } from 'components/UI/FormComponents';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';

import {
  getSentimentEmoji,
  handleKeyboardKeyChange,
} from '../../../../CustomFieldsForm/Fields/SentimentScaleField/utils';
import ErrorDisplay from '../../ErrorDisplay';
import VerificationIcon from '../../VerificationIcon';
import { getSubtextElement } from '../controlUtils';
import messages from '../messages';

import { StyledImg } from './components';
import { getAriaValueText } from './utils';

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
  const theme = useTheme();

  const currentAnswer = data; // The current answer is a value between 1 to 5

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
      sliderRef.current.setAttribute(
        'aria-valuenow',
        String(currentAnswer || minimum)
      );
      sliderRef.current.setAttribute(
        'aria-valuetext',
        getAriaLabel(currentAnswer || minimum, maximum)
      );
    }
  }, [currentAnswer, getAriaLabel, minimum, maximum]);

  // Handle keyboard input for the slider
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const value = currentAnswer || minimum;
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
          if (event.key !== 'Tab' && !event.metaKey) {
            // Don't override the default tab behaviour or meta key (E.g. Mac command key)
            handleKeyDown(event);
          }
        }}
        tabIndex={0}
      >
        <Box>
          <Table style={{ tableLayout: 'fixed' }}>
            <Thead>
              <Tr>
                {[...Array(maximum).keys()].map((i) => {
                  // The currentAnswer is 1-indexed, so it's easier here to add 1 to the mapped
                  // index for when we want to compare it to the currently selected value;
                  const visualIndex = i + 1;
                  const isSelected = currentAnswer === visualIndex;

                  return (
                    <Td py="4px" key={`${path}-radio-${visualIndex}`}>
                      <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                      >
                        <Button
                          p="0px"
                          m="0px"
                          id={`${path}-linear-scale-option-${visualIndex}`}
                          aria-pressed={isSelected}
                          width="100%"
                          tabIndex={-1}
                          onClick={() => {
                            if (isSelected) {
                              // Clear data from this question and any follow-up question
                              handleChange(path, undefined);
                              handleChange(`${path}_follow_up`, undefined);
                            } else {
                              handleChange(path, visualIndex);
                            }
                          }}
                          onFocus={() => {
                            sliderRef.current?.focus();
                          }}
                          buttonStyle="text"
                        >
                          <ScreenReaderOnly>
                            {getAriaLabel(visualIndex, maximum)}
                          </ScreenReaderOnly>
                          <Box>
                            {isSelected && (
                              <Box
                                borderRadius="45px"
                                background="white"
                                position="absolute"
                                ml="36px"
                                mt="-10px" // Required for precise positioning
                                aria-hidden
                              >
                                <Icon
                                  name="check-circle"
                                  fill={theme.colors.tenantPrimary}
                                />
                              </Box>
                            )}

                            <StyledImg
                              src={getSentimentEmoji(visualIndex)}
                              alt=""
                              aria-hidden
                              className={isSelected ? 'isSelected' : ''}
                            />
                          </Box>
                        </Button>
                      </Box>
                    </Td>
                  );
                })}
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                {[...Array(maximum).keys()].map((index) => {
                  return (
                    <Th
                      p="0px"
                      maxWidth="20%"
                      key={`${path}-radio-${index}`}
                      scope="col"
                      tabIndex={-1}
                      pb="8px"
                    >
                      <Text
                        textAlign="center"
                        m="0px"
                        px="4px"
                        color="grey700"
                        wordBreak="break-word"
                        lineHeight="1.2"
                      >
                        {labelsFromSchema[index]}

                        <ScreenReaderOnly>
                          {/* If there is not a label for this index, make sure that we still generate
                      a meaningful aria-label for screen readers.
                      */}
                          {!labelsFromSchema[index] &&
                            getAriaLabel(index + 1, maximum)}
                          {/* We use index + 1 because the index is 0-indexed, but the values are 1-indexed. */}
                        </ScreenReaderOnly>
                      </Text>
                    </Th>
                  );
                })}
              </Tr>
            </Tbody>
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
