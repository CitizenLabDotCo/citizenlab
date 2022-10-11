import React from 'react';

// components
import { Box, BoxProps } from '@citizenlab/cl2-component-library';

// styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import { SEMANTIC_UI_BORDER_INNER_COLOR } from './constants';

interface InnerBorders {
  headerCells?: string;
  bodyRows?: string;
}

const StyledBox = styled(Box)<{ innerBorders?: InnerBorders }>`
  text-align: left;
  font-size: ${fontSizes.s}px;
  color: ${colors.primary};
  border-collapse: separate;

  thead > th {
    border-bottom: 1px solid ${SEMANTIC_UI_BORDER_INNER_COLOR};
  }

  ${({ innerBorders }) =>
    !innerBorders?.headerCells
      ? ''
      : `
    thead > tr > th {
      border-right: ${innerBorders.headerCells};
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
      border-bottom: ${innerBorders?.bodyRows};
    }

    tbody > tr:last-child > td
      border-bottom: none;
    }
  `}
`;

interface Props extends BoxProps {
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
