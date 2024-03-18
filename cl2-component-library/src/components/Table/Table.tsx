import React from 'react';

import Box, { BoxProps } from '../Box';

import styled from 'styled-components';
import { colors, fontSizes } from '../../utils/styleUtils';

interface InnerBorders {
  headerCells?: boolean;
  bodyRows?: boolean;
}

const StyledBox = styled(Box)<{ innerBorders?: InnerBorders }>`
  text-align: left;
  font-size: ${fontSizes.s}px;
  color: ${colors.primary};
  border-collapse: separate;

  thead > tr > th {
    border-bottom: 1px solid ${colors.grey200};
  }

  ${({ innerBorders }) =>
    !innerBorders?.headerCells
      ? ''
      : `
    thead > tr > th {
      border-right: 1px solid ${colors.grey200};
    }

    thead > tr > th:last-child {
      border-right: none;
    }
  `}

  ${({ innerBorders }) =>
    !innerBorders?.bodyRows
      ? ''
      : `
    tbody > tr > td {
      border-bottom: 1px solid ${colors.grey200};
    }

    tbody > tr:last-child > td {
      border-bottom: none;
    }
  `}
`;

export interface Props extends BoxProps {
  innerBorders?: InnerBorders;
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
