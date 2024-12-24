import React from 'react';

import { Box, colors, stylingConsts } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

const StyledButton = styled(Box)<{ isSelected: boolean }>`
  ${({ isSelected }) =>
    isSelected
      ? `
    background-color: ${colors.teal200};
  `
      : `
    &:hover {
      background-color: ${colors.teal100};
    }
  `}
`;

interface Props {
  children: string;
  isSelected: boolean;
  ml?: string;
  onClick: () => void;
}

const DateButton = ({ children, isSelected, ml, onClick }: Props) => {
  return (
    <StyledButton
      as="button"
      mr="4px"
      ml={ml}
      px="8px"
      py="4px"
      cursor="pointer"
      borderRadius={stylingConsts.borderRadius}
      isSelected={isSelected}
      onClick={onClick}
    >
      {children}
    </StyledButton>
  );
};

export default DateButton;
