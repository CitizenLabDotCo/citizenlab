import React, { ReactNode } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

interface Props {
  label?: string;
  count: number;
  children: ReactNode;
}

// One group of a level: its spaces, its folders or its projects.
const Section = ({ label, count, children }: Props) => (
  <Box as="section" mb="32px">
    {label && (
      <Box as="h3" m="0" mb="8px">
        <Text as="span" variant="boControl" color="coolGrey600">
          {label}
        </Text>
        <Text as="span" variant="boControl" color="coolGrey500" ml="8px">
          {count}
        </Text>
      </Box>
    )}
    {children}
  </Box>
);

export default Section;
