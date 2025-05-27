import React, { useRef } from 'react';

import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';

import { IFlatCustomField } from 'api/custom_fields/types';

import useLocalize from 'hooks/useLocalize';

import messages from 'components/Form/Components/Controls/messages';

import { useIntl } from 'utils/cl-intl';
import { sanitizeForClassname } from 'utils/JSONFormUtils';

import Labels from './Labels';
import LinearScaleButton from './LinearScaleButton';
import { getLinearScaleLabel } from './utils';

interface Props {
  value?: number;
  question: IFlatCustomField;
  onChange: (value: number) => void;
}

const LinearScale = ({ value: data, question, onChange }: Props) => {
  const isSmallerThanPhone = useBreakpoint('phone');
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  const sliderRef = useRef<HTMLDivElement>(null);

  const minimum = 1;
  const maximum = question.maximum ?? 11;
  const name = question.key;

  const getAriaValueText = (value: number, total: number) => {
    // If the value has a label, read it out
    const label = getLinearScaleLabel(question, value);

    if (label) {
      return formatMessage(messages.valueOutOfTotalWithLabel, {
        value,
        total,
        label: localize(label),
      });
    }

    // If we don't have a label but we do have a maximum, read out the current value & maximum label
    const maxLabel = getLinearScaleLabel(question, maximum);

    if (maxLabel) {
      return formatMessage(messages.valueOutOfTotalWithMaxExplanation, {
        value,
        total,
        maxValue: maximum,
        maxLabel: localize(maxLabel),
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

    onChange(newValue);

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
      <div
        data-testid="linearScaleControl"
        role="slider"
        ref={sliderRef}
        aria-valuemin={minimum}
        aria-valuemax={maximum}
        aria-valuenow={data || minimum}
        aria-labelledby={sanitizeForClassname(name)}
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
                key={visualIndex}
                question={question}
                visualIndex={visualIndex}
                data={data}
                maximum={maximum}
                onSelect={onChange}
              />
            );
          })}
        </Box>
        <Labels question={question} maximum={maximum} />
      </div>
    </>
  );
};

export default LinearScale;
