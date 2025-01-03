import React from 'react';

import { Box, colors, stylingConsts } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

const StyledButton = styled(Box)<{ isSelected: boolean }>`
  ${({ isSelected }) =>
    isSelected
      ? `
    background-color: ${colors.teal100};
  `
      : `
    &:hover {
      background-color: ${colors.teal100};
    }
  `}
`;

interface Props {
  children: string;
  className?: string;
  isSelected: boolean;
  mr?: string;
  onClick: () => void;
}

const DateButton = ({
  children,
  className,
  isSelected,
  mr,
  onClick,
}: Props) => {
  return (
    <StyledButton
      className={className}
      as="button"
      px="8px"
      py="4px"
      cursor="pointer"
      mr={mr}
      borderRadius={stylingConsts.borderRadius}
      isSelected={isSelected}
      onClick={onClick}
    >
      {children}
    </StyledButton>
  );
};

export default DateButton;
