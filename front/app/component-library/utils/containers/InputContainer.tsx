import React from 'react';

import styled from 'styled-components';

import Icon from '../../components/Icon';
import { defaultInputStyle, colors, fontSizes } from '../styleUtils';

const Container = styled.button<{ disabled: boolean }>`
  ${defaultInputStyle};
  cursor: pointer;
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: ${fontSizes.base}px;

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
  onClick: () => void;
}

const InputContainer = ({ id, disabled = false, children, onClick }: Props) => {
  return (
    <Container
      id={id}
      className="e2e-date-phase-picker-input"
      disabled={disabled}
      onClick={(e) => {
        if (disabled) return;
        e.preventDefault();
        onClick();
      }}
    >
      {children}
      <Icon name="calendar" height="18px" />
    </Container>
  );
};

export default InputContainer;
