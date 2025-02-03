import React from 'react';

// components

// styling
import styled from 'styled-components';

import { colors, fontSizes } from '../../utils/styleUtils';
import Box, { BoxProps } from '../Box';

interface InnerBorders {
  headerCells?: boolean;
  bodyRows?: boolean;
  bodyCells?: boolean;
}

const StyledBox = styled(Box)<{
  innerBorders?: InnerBorders;
  borderSpacing?: string;
}>`
  text-align: left;
  font-size: ${fontSizes.s}px;
  color: ${colors.primary};
  border-collapse: separate;
  border-spacing: ${({ borderSpacing }) => borderSpacing || '0'};

  thead > tr > th {
    border-bottom: 1px solid ${colors.grey200};
  }

  ${({ innerBorders }) =>
    innerBorders?.headerCells
      ? `
    thead > tr > th {
      border-right: 1px solid ${colors.grey200};
    }

    thead > tr > th:last-child {
      border-right: none;
    }
  `
      : ''}

  ${({ innerBorders }) =>
    innerBorders?.bodyRows
      ? `
      tbody > tr > td {
        border-bottom: 1px solid ${colors.grey200};
      }
  
      tbody > tr:last-child > td {
        border-bottom: none;
      }
    `
      : ''}

  ${({ innerBorders }) =>
    innerBorders?.bodyCells
      ? `
      tbody > tr > td {
        border-right: 1px solid ${colors.grey200};
      }
  
      tbody > tr > td:last-child {
        border-right: none;
      }
    `
      : ''}
`;
export interface Props extends BoxProps {
  innerBorders?: InnerBorders;
  borderSpacing?: string;
}

const Table = ({ children, innerBorders, ...otherProps }: Props) => (
  <StyledBox
    as="table"
    width="100%"
    innerBorders={innerBorders}
    {...otherProps}
  >
    {children}
  </StyledBox>
);

export default Table;
