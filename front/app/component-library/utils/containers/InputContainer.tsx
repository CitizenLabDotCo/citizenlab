import React from 'react';

import styled from 'styled-components';

import {
  defaultInputStyle,
  colors,
  fontSizes,
  stylingConsts,
} from '../styleUtils';

const Container = styled.button<{ disabled: boolean }>`
  ${defaultInputStyle};
  cursor: pointer;
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: ${fontSizes.base}px;
  height: ${stylingConsts.inputHeight}px;

  color: ${colors.grey800};

  ${({ disabled }) =>
    disabled
      ? `
    cursor: not-allowed;
    color: ${colors.grey500};
    svg {
      fill: ${colors.grey500};
    }
  `
      : `
  &:hover,
  &:focus {
      color: ${colors.black};
  }

  svg {
    fill: ${colors.grey700};
  }

  &:hover svg,
  &:focus svg {
    fill: ${colors.black};
  }
  `}
`;

interface Props {
  id?: string;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

const InputContainer = ({
  id,
  disabled = false,
  children,
  className,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
}: Props) => {
  return (
    <Container
      id={id}
      className={className}
      disabled={disabled}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={(e) => {
        if (disabled) return;
        e.preventDefault();
        onClick?.();
      }}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      {children}
    </Container>
  );
};

export default InputContainer;
