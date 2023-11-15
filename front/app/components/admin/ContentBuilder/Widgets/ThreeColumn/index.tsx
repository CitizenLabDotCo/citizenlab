import React from 'react';

// components
import {
  Box,
  BoxProps,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';

// craft
import { Element } from '@craftjs/core';
import Container from '../Container';

// i18n
import messages from './messages';

export const ThreeColumnWrapper = ({
  children,
  ...rest
}: {
  children: React.ReactNode;
} & BoxProps) => {
  const isSmallerThanTablet = useBreakpoint('tablet');
  return (
    <Box
      id="e2e-three-column"
      flexDirection={isSmallerThanTablet ? 'column' : 'row'}
      minHeight="40px"
      display="flex"
      w="100%"
      gap="24px"
      {...rest}
    >
      {children}
    </Box>
  );
};

const ThreeColumn = () => {
  return (
    <ThreeColumnWrapper>
      <Box flex="1">
        <Element id="column1" is={Container} canvas />
      </Box>
      <Box flex="1">
        <Element id="column2" is={Container} canvas />
      </Box>
      <Box flex="1">
        <Element id="column3" is={Container} canvas />
      </Box>
    </ThreeColumnWrapper>
  );
};

export const ThreeColumnSettings = () => {
  return <Box />;
};

export const threeColumnCraftConfig = {
  related: {
    settings: ThreeColumnSettings,
  },
  custom: {
    title: messages.threeColumn,
    hasChildren: true,
  },
};

ThreeColumn.craft = threeColumnCraftConfig;

export default ThreeColumn;
