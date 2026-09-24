import React from 'react';

import { Box, NewBOText } from '@citizenlab/cl2-component-library';

interface Props {
  title: string;
  meta?: string;
}

const PanelHeading = ({ title, meta }: Props) => (
  <Box
    display="flex"
    alignItems="baseline"
    justifyContent="space-between"
    gap="8px"
    mb="6px"
  >
    <NewBOText variant="section" color="textSecondary">
      {title}
    </NewBOText>
    {meta && <NewBOText variant="micro">{meta}</NewBOText>}
  </Box>
);

export default PanelHeading;
