import React, { useEffect, useRef } from 'react';

import {
  Box,
  Button,
  colors,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import styled, { useTheme } from 'styled-components';

import { IFlatCustomField } from 'api/custom_fields/types';

interface Props {
  question: IFlatCustomField;
  visualIndex: number;
  data?: number;
  maximum: number;
  onSelect: (value: number | undefined) => void;
}

const StyledButton = styled(Button)<{ selected: boolean }>`
  &:hover {
    box-shadow: 0 0 0 1px
      ${({ selected }) => (selected ? 'undefined' : colors.borderDark)};
  }
`;

const LinearScaleButton = ({
  question,
  visualIndex,
  data,
  maximum,
  onSelect,
}: Props) => {
  const theme = useTheme();
  const isSmallerThanPhone = useBreakpoint('phone');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const name = question.key;
  const isSelected = data === visualIndex;

  // Set aria-pressed on the inner <button> element, not the wrapper <div>
  useEffect(() => {
    const button = wrapperRef.current?.querySelector('button');
    if (button) {
      button.setAttribute('aria-pressed', String(isSelected));
    }
  }, [isSelected]);

  const getButtonWidth = () => {
    if (isSmallerThanPhone) {
      return `calc(100% / ${maximum > 5 ? 4 : maximum} - 8px)`; // Fit 4 buttons per row on small screens
    }
    return `calc(100% / ${maximum} - 8px)`; // Fit all buttons on one row for larger screens
  };

  return (
    <Box
      ref={wrapperRef}
      flexBasis={100 / maximum}
      key={`${name}-radio-${visualIndex}`}
      minWidth={getButtonWidth()}
      padding="16px, 20px, 16px, 20px"
    >
      <StyledButton
        py="12px"
        id={`linear-scale-option-${visualIndex}`}
        selected={isSelected}
        tabIndex={-1}
        borderRadius="3px"
        borderColor={
          isSelected ? theme.colors.tenantPrimary : theme.colors.borderDark
        }
        borderHoverColor={
          isSelected ? theme.colors.tenantPrimary : theme.colors.borderDark
        }
        bgColor={isSelected ? theme.colors.tenantPrimary : theme.colors.white}
        bgHoverColor={
          isSelected ? theme.colors.tenantPrimary : theme.colors.white
        }
        textHoverColor={isSelected ? colors.white : theme.colors.textPrimary}
        textColor={isSelected ? colors.white : theme.colors.textPrimary}
        width="100%"
        onClick={() => onSelect(isSelected ? undefined : visualIndex)}
      >
        {visualIndex}
      </StyledButton>
    </Box>
  );
};

export default LinearScaleButton;
