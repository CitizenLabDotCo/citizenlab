import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import styled, { useTheme } from 'styled-components';

const StyledBox = styled(Box)<{ selected: boolean }>`
  cursor: pointer;
  &:hover {
    box-shadow: ${({ selected }) =>
      selected ? 'none' : `0 0 0 1px ${colors.borderDark}`};
  }
`;

// Spread onto the Radio inside the box rather than set on the box itself:
// the Radio's root handles the click, so this way the whole box is clickable.
export const radioOptionPadding = {
  padding: '20px 20px 8px 20px',
} as const;

interface Props {
  selected: boolean;
  children: React.ReactNode;
}

// Bordered box around a single radio option, highlighted when selected
const RadioOptionBox = ({ selected, children }: Props) => {
  const theme = useTheme();

  return (
    <StyledBox
      mb="12px"
      border={
        selected
          ? `2px solid ${theme.colors.tenantPrimary}`
          : `1px solid ${theme.colors.borderDark}`
      }
      borderRadius="3px"
      selected={selected}
    >
      {children}
    </StyledBox>
  );
};

export default RadioOptionBox;
