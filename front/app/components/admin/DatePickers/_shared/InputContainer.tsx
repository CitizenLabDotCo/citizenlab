import React from 'react';

import {
  defaultInputStyle,
  colors,
  fontSizes,
  Icon,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

const Container = styled.button`
  ${defaultInputStyle};
  cursor: pointer;
  display: flex;
  flex-direction: row;
  font-size: ${fontSizes.base}px;

  color: ${colors.grey800};

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
`;

interface Props {
  children: React.ReactNode;
  onClick: () => void;
}

const InputContainer = ({ children, onClick }: Props) => {
  return (
    <Container
      onClick={(e) => {
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
