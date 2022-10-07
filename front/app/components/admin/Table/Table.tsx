import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';

// styling
import { colors, fontSizes } from 'utils/styleUtils';
import {
  SEMANTIC_UI_BORDER_COLOR,
  SEMANTIC_UI_BORDER_RADIUS,
} from './constants';

interface Props {
  children: React.ReactNode;
}

const Table = ({ children }: Props) => (
  <Box
    as="table"
    width="100%"
    border={`1px solid ${SEMANTIC_UI_BORDER_COLOR}`}
    borderRadius={SEMANTIC_UI_BORDER_RADIUS}
    color={colors.primary}
    style={{
      textAlign: 'left',
      fontSize: `${fontSizes.s}px`,
    }}
  >
    {children}
  </Box>
);

export default Table;
