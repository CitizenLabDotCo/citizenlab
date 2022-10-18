import React from 'react';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

interface Props {
  children: React.ReactNode;
  background?: string;
}

const StyledTFoot = styled.tfoot<{ background?: string }>`
  background: ${({ background }) => background ?? 'white'};

  tr:first-child > td {
    border-top: 1px solid ${colors.grey200};
  }
`;

const Tfoot = ({ children, background }: Props) => (
  <StyledTFoot background={background}>{children}</StyledTFoot>
);

export default Tfoot;
