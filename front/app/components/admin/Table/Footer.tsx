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
}

const StyledTFoot = styled.tfoot<{ background: string }>`
  background: ${({ background }) => background};

  tr:first-child > td {
    border-top: 1px solid ${SEMANTIC_UI_BORDER_INNER_COLOR};
  }
`;

const Footer = ({
  children,
  background = SEMANTIC_UI_HEADER_BG_COLOR,
}: Props) => <StyledTFoot background={background}>{children}</StyledTFoot>;

export default Footer;
