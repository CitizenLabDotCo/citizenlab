import React from 'react';

// components
import { Box, BoxProps } from '@citizenlab/cl2-component-library';

// styling
import styled from 'styled-components';
import {
  SEMANTIC_UI_BORDER_INNER_COLOR,
  SEMANTIC_UI_HEADER_BG_COLOR_DARKER,
} from './constants';

interface Props extends BoxProps {
  colSpan?: `${number}`;
  clickable?: boolean;
}

const StyledBox = styled(Box)<{ clickable?: boolean }>`
  ${({ clickable }) =>
    !clickable
      ? ''
      : `
    &:hover {
      background: ${SEMANTIC_UI_HEADER_BG_COLOR_DARKER};
      cursor: pointer;
    }
  `}
`;

const HeaderCell = ({ children, colSpan, ...otherProps }: Props) => (
  <StyledBox
    as="th"
    borderBottom={`1px solid ${SEMANTIC_UI_BORDER_INNER_COLOR}`}
    p="12px"
    colSpan={colSpan as any}
    {...otherProps}
  >
    {children}
  </StyledBox>
);

export default HeaderCell;
