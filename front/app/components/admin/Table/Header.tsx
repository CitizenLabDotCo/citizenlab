import React from 'react';

// styling
import styled from 'styled-components';
import {
  SEMANTIC_UI_HEADER_BG_COLOR,
  SEMANTIC_UI_BORDER_INNER_COLOR,
} from './constants';

interface Props {
  children: React.ReactNode;
  background?: string;
  verticalBorders?: boolean;
}

const StyledTHead = styled.thead<{
  background: string;
  verticalBorders?: boolean;
}>`
  background-color: ${({ background }) => background};

  ${({ verticalBorders }) =>
    !verticalBorders
      ? ''
      : `
    th {
      border-right: 1px solid ${SEMANTIC_UI_BORDER_INNER_COLOR};
    }

    th:last-child {
      border-right: none;
    }
  `}
`;

const Header = ({
  children,
  background = SEMANTIC_UI_HEADER_BG_COLOR,
  verticalBorders,
}: Props) => (
  <StyledTHead background={background} verticalBorders={verticalBorders}>
    {children}
  </StyledTHead>
);

export default Header;
