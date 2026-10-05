import React from 'react';

import {
  useBreakpoint,
  Title,
  TitleProps,
} from '@citizenlab/cl2-component-library';

import { DEFAULT_PADDING } from 'components/admin/ContentBuilder/constants';

interface Props extends TitleProps {
  children: React.ReactNode;
}

const CarrouselTitle = ({ children, ...titleProps }: Props) => {
  const isSmallerThanPhone = useBreakpoint('phone');

  return (
    <Title
      variant="h2"
      mt="0px"
      ml={isSmallerThanPhone ? DEFAULT_PADDING : undefined}
      color="tenantText"
      {...titleProps}
    >
      {children}
    </Title>
  );
};

export default CarrouselTitle;
