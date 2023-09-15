import React from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';

interface Props {
  bgColor?: string;
}

const ButtonComp = styled.button<{ bgColor?: string }>`
  background-color: ${({ bgColor }) => bgColor ?? 'red'};
  padding: 12px;
  cursor: pointer;

  &:hover {
    background-color: blue;
  }
`;

const Button = ({ bgColor }: Props) => {
  const { param } = useParams();

  return (
    <ButtonComp
      bgColor={bgColor}
      onClick={() => updateSearchParams({ clicked: true })}
    >
      Bla ({param})
    </ButtonComp>
  );
};

export default Button;
