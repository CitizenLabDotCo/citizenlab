import React, { ReactNode } from 'react';

import { Box, Td, Text } from '@citizenlab/cl2-component-library';

interface Props {
  children?: ReactNode;
  // Counts read as values; the rest of the columns are quieter labels.
  numeric?: boolean;
}

const TextCell = ({ children, numeric = false }: Props) => (
  <Td>
    <Box display="flex" justifyContent={numeric ? 'flex-end' : 'flex-start'}>
      <Text
        as="span"
        m="0"
        variant="boMicro"
        whiteSpace="nowrap"
        color={numeric ? 'coolGrey700' : 'coolGrey600'}
      >
        {children}
      </Text>
    </Box>
  </Td>
);

export default TextCell;
