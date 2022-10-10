import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';

// styling
import styled from 'styled-components';
import { SEMANTIC_UI_BORDER_INNER_COLOR } from './constants';

const BorderBox = styled(Box)`
  td {
    border-bottom: 1px solid ${SEMANTIC_UI_BORDER_INNER_COLOR};
  }

  &:last-child {
    td {
      border-bottom: none;
    }
  }
`;

interface Props {
  children: React.ReactNode;
  borderHorizontal?: boolean;
  className?: string;
}

const Row = ({ children, borderHorizontal = true, className }: Props) =>
  borderHorizontal ? (
    <BorderBox as="tr" className={className}>
      {children}
    </BorderBox>
  ) : (
    <Box as="tr" className={className}>
      {children}
    </Box>
  );

export default Row;
