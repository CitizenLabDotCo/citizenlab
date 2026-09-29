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
      padding="20px 20px 8px 20px"
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
