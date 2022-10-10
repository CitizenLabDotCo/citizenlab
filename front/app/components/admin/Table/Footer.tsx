import React from 'react';

// styling
import styled from 'styled-components';
import {
  SEMANTIC_UI_HEADER_BG_COLOR,
  SEMANTIC_UI_BORDER_INNER_COLOR,
} from './constants';

interface Props {
  children: React.ReactNode;
}

const StyledTFoot = styled.tfoot`
  background: ${SEMANTIC_UI_HEADER_BG_COLOR};

  tr:first-child > th {
    border-top: 1px solid ${SEMANTIC_UI_BORDER_INNER_COLOR};
  }
  tr:last-child > th {
    border-bottom: none;
  }
`;

const Footer = ({ children }: Props) => <StyledTFoot>{children}</StyledTFoot>;

export default Footer;
