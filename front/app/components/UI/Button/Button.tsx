import React from 'react';
import styled from 'styled-components';

interface Props {
  bgColor?: string;
}

const ButtonComp = styled.button<{ bgColor?: string }>`
  background-color: ${({ bgColor }) => bgColor};
  padding: 12px;
`;

const Button = ({ bgColor }: Props) => {
  return <ButtonComp bgColor={bgColor}>Bla</ButtonComp>;
};

export default Button;
