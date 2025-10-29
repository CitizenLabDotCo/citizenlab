import React from 'react';

import {
  defaultInputStyle,
  colors,
  fontSizes,
  Icon,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

const Container = styled.div<{ disabled: boolean }>`
  ${defaultInputStyle};
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: ${fontSizes.base}px;
  height: ${stylingConsts.inputHeight}px;
  padding-left: 4px;
  padding-right: 10px;
  padding-top: 8px;
  padding-bottom: 8px;
  cursor: default;

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
}

const InputContainer = ({ id, disabled = false, children }: Props) => {
  return (
    <Container
      id={id}
      className="e2e-date-phase-picker-input"
      disabled={disabled}
    >
      {children}
      <Icon name="calendar" height="18px" />
    </Container>
  );
};

export default InputContainer;
