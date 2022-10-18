import React from 'react';

// styling
import styled from 'styled-components';

export interface Props {
  children: React.ReactNode;
  className?: string;
  background?: string;
}

const StyledTr = styled.tr<{ background?: string }>`
  ${({ background }) =>
    !background
      ? ''
      : `
    background: ${background};
  `}
`;

const Tr = React.forwardRef(
  (
    { children, className, background }: Props,
    ref: React.RefObject<HTMLTableRowElement>
  ) => (
    <StyledTr className={className} ref={ref} background={background}>
      {children}
    </StyledTr>
  )
);

export default Tr;
