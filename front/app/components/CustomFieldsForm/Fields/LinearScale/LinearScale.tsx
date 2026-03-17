import React, { useRef } from 'react';

import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';

import { IFlatCustomField } from 'api/custom_fields/types';

import { sanitizeForClassname } from 'utils/JSONFormUtils';

import Labels from './Labels';
import LinearScaleOption from './LinearScaleButton';

interface Props {
  value?: number;
  question: IFlatCustomField;
  onChange: (value: number | undefined) => void;
}

const LinearScale = ({ value: data, question, onChange }: Props) => {
  const isSmallerThanPhone = useBreakpoint('phone');
  const groupRef = useRef<HTMLDivElement>(null);

  const minimum = 1;
  const maximum = question.maximum ?? 11;
  const name = question.key;

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

    // Move focus to the newly selected option
    const nextOption = groupRef.current?.querySelector(
      `#linear-scale-option-${newValue}`
    ) as HTMLElement | null;
    nextOption?.focus();

    event.preventDefault();
  };

  return (
    <>
      <div
        data-testid="linearScaleControl"
        role="radiogroup"
        ref={groupRef}
        aria-labelledby={`${sanitizeForClassname(name)}-label`}
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
              <LinearScaleOption
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
