import React, { ReactNode } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

interface Props {
  title: string;
  description: string;
  children: ReactNode;
}

const ImporterRow = ({ title, description, children }: Props) => (
  <Box display="flex" flexDirection="column" alignItems="flex-start">
    <Text as="span" variant="boControl" m="0">
      {title}
    </Text>
    <Text as="span" variant="boHelper" m="0" mt="2px" mb="12px">
      {description}
    </Text>
    {children}
  </Box>
);

export default ImporterRow;
