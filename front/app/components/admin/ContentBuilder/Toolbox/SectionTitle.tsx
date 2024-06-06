import React from 'react';

import { Title } from '@citizenlab/cl2-component-library';

interface Props {
  children: React.ReactNode;
}

const SectionTitle = ({ children }: Props) => (
  <Title
    fontWeight="normal"
    mb="4px"
    mt="24px"
    ml="10px"
    styleVariant="h6"
    as="h3"
    color="textSecondary"
  >
    {children}
  </Title>
);

export default SectionTitle;
