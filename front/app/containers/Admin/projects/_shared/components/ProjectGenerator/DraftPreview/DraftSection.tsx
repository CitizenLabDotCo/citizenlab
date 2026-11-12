import React, { ReactNode } from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

type Props = {
  title: string;
  children: ReactNode;
};

const DraftSection = ({ title, children }: Props) => (
  <Box as="section" display="flex" flexDirection="column" gap="12px">
    <Title variant="h4" as="h3" m="0px">
      {title}
    </Title>
    {children}
  </Box>
);

export default DraftSection;
