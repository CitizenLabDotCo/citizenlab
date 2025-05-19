import React, { useRef } from 'react';

import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';

import { IFlatCustomField } from 'api/custom_fields/types';
import { sanitizeForClassname } from 'utils/JSONFormUtils';
import { useIntl } from 'utils/cl-intl';
import LinearScaleButton from './LinearScaleButton';
import Labels from './Labels';

interface Props {
  data?: number;
  question: IFlatCustomField;
  onSelect: (value: number) => void;
}

const LinearScale = ({ data, question, onSelect }: Props) => {
  const isSmallerThanPhone = useBreakpoint('phone');
  const { formatMessage } = useIntl();

  const sliderRef = useRef<HTMLDivElement>(null);

  const minimum = 1;
  const maximum = question.maximum ?? 11;

  const getAriaValueText = (value: number, total: number) => {
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

    onSelect(newValue);

    if (sliderRef.current) {
      sliderRef.current.setAttribute('aria-valuenow', String(newValue));
      sliderRef.current.setAttribute(
        'aria-valuetext',
        getAriaValueText(newValue, maximum)
      );
    }
    event.preventDefault();
  };

  return (
    <>
      {/* {answerNotPublic && (
              <Text mb="8px" mt="0px" fontSize="s">
                <FormattedMessage {...messages.notPublic} />
              </Text>
            )} */}
      <Box
        data-testid="linearScaleControl"
        role="slider"
        ref={sliderRef}
        aria-valuemin={minimum}
        aria-valuemax={maximum}
        aria-labelledby={sanitizeForClassname(question.key)}
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
              <LinearScaleButton
                question={question}
                visualIndex={visualIndex}
                data={data}
                onSelect={onSelect}
              />
            );
          })}
        </Box>
        <Labels />
        {/* <VerificationIcon show={uischema.options?.verificationLocked} /> */}
      </Box>
    </>
  );
};

export default LinearScale;
