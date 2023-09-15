import React from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';

interface Props {
  bgColor?: string;
}

const ButtonComp = styled.button<{ bgColor?: string }>`
  background-color: ${({ bgColor }) => bgColor ?? 'red'};
  padding: 12px;
`;

const Button = ({ bgColor }: Props) => {
  const { param } = useParams();

  return <ButtonComp bgColor={bgColor}>Bla ({param})</ButtonComp>;
};

export default Button;
