import React from 'react';

// styling
import styled from 'styled-components';

export interface Props {
  children: React.ReactNode;
  className?: string;
  background?: string;
  innerRef?: React.RefObject<HTMLTableRowElement>;
}

const StyledTr = styled.tr<{ background?: string }>`
  ${({ background }) =>
    !background
      ? ''
      : `
    background: ${background};
  `}
`;

const Tr = ({ children, className, background, innerRef }: Props) => (
  <StyledTr className={className} ref={innerRef} background={background}>
    {children}
  </StyledTr>
);

export default Tr;
