import React from 'react';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

interface Props {
  children: React.ReactNode;
  background?: string;
}

const StyledTHead = styled.thead<{ background: string }>`
  background: ${({ background }) => background};
`;

const Header = ({ children, background = colors.grey50 }: Props) => (
  <StyledTHead background={background}>{children}</StyledTHead>
);

export default Header;
