import React from 'react';

import { useBreakpoint, Title } from '@citizenlab/cl2-component-library';

import { DEFAULT_PADDING } from 'components/admin/ContentBuilder/constants';

interface Props {
  children: React.ReactNode;
}

const CarrouselTitle = ({ children }: Props) => {
  const isSmallerThanPhone = useBreakpoint('phone');

  return (
    <Title
      variant="h2"
      mt="0px"
      ml={isSmallerThanPhone ? DEFAULT_PADDING : undefined}
      color="tenantText"
    >
      {children}
    </Title>
  );
};

export default CarrouselTitle;
