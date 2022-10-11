import React from 'react';

// components
import { Box, BoxProps } from '@citizenlab/cl2-component-library';

// styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import {
  SEMANTIC_UI_BORDER_INNER_COLOR,
  SEMANTIC_UI_BORDER_RADIUS,
} from './constants';

interface Borders {
  around?: string;
  headerCells?: string;
  bodyRows?: string;
}

const StyledBox = styled(Box)<{ borders?: Borders }>`
  text-align: left;
  font-size: ${fontSizes.s}px;
  color: ${colors.primary};
  border-collapse: seperate;

  thead > th {
    border-bottom: 1px solid ${SEMANTIC_UI_BORDER_INNER_COLOR};
  }

  ${({ borders }) =>
    !borders?.around
      ? ''
      : `
    border: ${borders.around};
    border-radius: ${SEMANTIC_UI_BORDER_RADIUS};
  `}

  ${({ borders }) =>
    !borders?.headerCells
      ? ''
      : `
    thead > tr > th {
      border-right: ${borders.headerCells};
    }

    thead > tr > th:last-child {
      border-right: none;
    }
  `}

  ${({ borders }) =>
    !borders?.bodyRows
      ? ''
      : `
    tbody > tr > td {
      border-bottom: ${borders?.bodyRows};
    }

    tbody > tr:last-child > td
      border-bottom: none;
    }
  `}
`;

interface Props extends BoxProps {
  borders?: Borders;
}

const Table = ({ children, borders, ...otherProps }: Props) => (
  <StyledBox as="table" width="100%" borders={borders} {...otherProps}>
    {children}
  </StyledBox>
);

export default Table;
