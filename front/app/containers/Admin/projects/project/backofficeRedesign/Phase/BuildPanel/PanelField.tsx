import React, { ReactNode } from 'react';

import { Box, NewBOText } from '@citizenlab/cl2-component-library';

interface Props {
  label: ReactNode;
  children: ReactNode;
}

const PanelField = ({ label, children }: Props) => (
  <Box mb="16px">
    <NewBOText variant="section" mb="8px">
      {label}
    </NewBOText>
    {children}
  </Box>
);

export default PanelField;
