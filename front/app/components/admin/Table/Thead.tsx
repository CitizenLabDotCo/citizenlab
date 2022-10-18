import React from 'react';

// styling
import styled from 'styled-components';

interface Props {
  children: React.ReactNode;
  background?: string;
}

const StyledTHead = styled.thead<{ background?: string }>`
  background: ${({ background }) => background ?? 'white'};
`;

const THead = ({ children, background }: Props) => (
  <StyledTHead background={background}>{children}</StyledTHead>
);

export default THead;
