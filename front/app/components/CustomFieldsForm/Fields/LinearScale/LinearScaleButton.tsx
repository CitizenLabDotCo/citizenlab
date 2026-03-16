import React from 'react';

import { Box, Text, useBreakpoint } from '@citizenlab/cl2-component-library';
import styled, { useTheme } from 'styled-components';

import { IFlatCustomField } from 'api/custom_fields/types';

import useLocalize from 'hooks/useLocalize';

import { getLinearScaleLabel } from './utils';

interface Props {
  question: IFlatCustomField;
  visualIndex: number;
  data?: number;
  maximum: number;
  onSelect: (value: number | undefined) => void;
}

const RadioOption = styled.div<{
  selected: boolean;
  borderColor: string;
  selectedBorderColor: string;
  bgColor: string;
  selectedBgColor: string;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 12px 0;
  border: 1px solid
    ${({ selected, borderColor, selectedBorderColor }) =>
      selected ? selectedBorderColor : borderColor};
  border-radius: 3px;
  background-color: ${({ selected, bgColor, selectedBgColor }) =>
    selected ? selectedBgColor : bgColor};
  cursor: pointer;

  &:hover {
    box-shadow: ${({ selected, borderColor }) =>
      selected ? 'none' : `0 0 0 1px ${borderColor}`};
  }

  &:focus-visible {
    outline: 2px solid ${({ selectedBorderColor }) => selectedBorderColor};
    outline-offset: 2px;
  }
`;

const LinearScaleOption = ({
  question,
  visualIndex,
  data,
  maximum,
  onSelect,
}: Props) => {
  const theme = useTheme();
  const isSmallerThanPhone = useBreakpoint('phone');
  const localize = useLocalize();

  const name = question.key;
  const isSelected = data === visualIndex;

  const getButtonWidth = () => {
    if (isSmallerThanPhone) {
      return `calc(100% / ${maximum > 5 ? 4 : maximum} - 8px)`; // Fit 4 buttons per row on small screens
    }
    return `calc(100% / ${maximum} - 8px)`; // Fit all buttons on one row for larger screens
  };

  const label = getLinearScaleLabel(question, visualIndex);
  const ariaLabel = label
    ? `${visualIndex} - ${localize(label)}`
    : `${visualIndex}`;

  return (
    <Box
      flexBasis={100 / maximum}
      key={`${name}-radio-${visualIndex}`}
      minWidth={getButtonWidth()}
      padding="16px, 20px, 16px, 20px"
    >
      <RadioOption
        id={`linear-scale-option-${visualIndex}`}
        role="radio"
        aria-checked={isSelected}
        aria-label={ariaLabel}
        tabIndex={isSelected || (!data && visualIndex === 1) ? 0 : -1}
        selected={isSelected}
        borderColor={theme.colors.borderDark}
        selectedBorderColor={theme.colors.tenantPrimary}
        bgColor={theme.colors.white}
        selectedBgColor={theme.colors.tenantPrimary}
        onClick={(e) => {
          onSelect(isSelected ? undefined : visualIndex);
          (e.currentTarget as HTMLElement).focus();
        }}
      >
        <Text
          m="0px"
          color={isSelected ? 'white' : 'textPrimary'}
          fontSize="base"
        >
          {visualIndex}
        </Text>
      </RadioOption>
    </Box>
  );
};

export default LinearScaleOption;
