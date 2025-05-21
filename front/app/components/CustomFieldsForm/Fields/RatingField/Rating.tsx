import React, { useRef } from 'react';
import { IFlatCustomField } from 'api/custom_fields/types';

import {
  Box,
  useBreakpoint,
  Button,
  Icon,
} from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';
import { sanitizeForClassname } from 'utils/JSONFormUtils';

interface Props {
  value?: number;
  question: IFlatCustomField;
  onChange: (value: number) => void;
}

const Rating = ({ value: data, question, onChange }: Props) => {
  const isSmallerThanPhone = useBreakpoint('phone');
  const theme = useTheme();

  const minimum = 1;
  const maximum = question.maximum ?? 10;
  const sliderRef = useRef<HTMLDivElement>(null);

  const id = question.key;

  const labelId = `${sanitizeForClassname(id)}-label`;
  const inputId = `${sanitizeForClassname(id)}-rating-input`;

  const getButtonWidth = () => {
    return isSmallerThanPhone
      ? `calc(100% / ${maximum > 5 ? 4 : maximum} - 8px)`
      : `calc(100% / ${maximum} - 8px)`;
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
    }
    event.preventDefault();
  };

  return (
    <>
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
            const selectedIndex = data !== undefined && data >= visualIndex;

            return (
              <Box
                flexBasis={100 / maximum}
                key={`${id}-radio-${visualIndex}`}
                minWidth={getButtonWidth()}
              >
                <Button
                  py="12px"
                  id={`${inputId}-option-${visualIndex}`}
                  tabIndex={-1}
                  aria-pressed={data === visualIndex}
                  px="0"
                  width="100%"
                  onClick={() => onChange(visualIndex)}
                  buttonStyle="text"
                >
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    gap="4px"
                  >
                    <Icon
                      name={selectedIndex ? 'ratingFilled' : 'rating'}
                      height="40px"
                      width="40px"
                      fill={
                        selectedIndex
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
    </>
  );
};

export default Rating;
