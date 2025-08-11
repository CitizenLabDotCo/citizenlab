import React from 'react';

// styling
import styled from 'styled-components';

export interface Props {
  children: React.ReactNode;
  className?: string;
  background?: string;
  dataCy?: string;
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

const Tr = ({ children, className, background, innerRef, dataCy }: Props) => (
  <StyledTr
    className={className}
    ref={innerRef}
    background={background}
    data-cy={dataCy}
  >
    {children}
  </StyledTr>
);

export default Tr;
