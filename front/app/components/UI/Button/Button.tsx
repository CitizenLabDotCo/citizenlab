import React from 'react';
import styled from 'styled-components';
import { useParams, useLocation } from 'react-router-dom';

interface Props {
  bgColor?: string;
}

const ButtonComp = styled.button<{ bgColor?: string }>`
  background-color: ${({ bgColor }) => bgColor ?? 'red'};
  padding: 12px;
`;

const Button = ({ bgColor }: Props) => {
  const params = useParams();
  const location = useLocation();
  console.log({ params, location });

  return <ButtonComp bgColor={bgColor}>Bla ({params.param})</ButtonComp>;
};

export default Button;
