import React, { ReactNode } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

interface Props {
  label: ReactNode;
  children: ReactNode;
}

/** The admin `SectionField` is too loud and too tall at panel width. */
const PanelField = ({ label, children }: Props) => (
  <Box mb="16px">
    <Text
      fontSize="s"
      fontWeight="semi-bold"
      color="textPrimary"
      m="0"
      mb="8px"
    >
      {label}
    </Text>
    {children}
  </Box>
);

export default PanelField;
