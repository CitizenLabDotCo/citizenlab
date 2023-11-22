import React from 'react';

// components
import {
  Box,
  BoxProps,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';

// craft
import { Element, useNode } from '@craftjs/core';
import Container from '../Container';

// i18n
import messages from './messages';
import useCraftComponentDefaultPadding from '../../useCraftComponentDefaultPadding';

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
  const { parent } = useNode((node) => ({
    parent: node.data.parent,
  }));

  const componentDefaultPadding = useCraftComponentDefaultPadding(parent);
  return (
    <ThreeColumnWrapper
      maxWidth="1200px"
      margin="0 auto"
      px={componentDefaultPadding}
    >
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
