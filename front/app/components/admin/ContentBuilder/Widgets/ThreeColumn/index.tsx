import React from 'react';

import {
  Box,
  BoxProps,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import { Element } from '@craftjs/core';

import { BUILDER_CONTENT_MAX_WIDTH } from 'components/admin/ContentBuilder/constants';

import useCraftComponentDefaultPadding from '../../useCraftComponentDefaultPadding';
import Container from '../Container';

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
      className="e2e-three-column"
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
  const componentDefaultPadding = useCraftComponentDefaultPadding();
  return (
    <ThreeColumnWrapper
      maxWidth={BUILDER_CONTENT_MAX_WIDTH}
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

export const threeColumnTitle = messages.threeColumn;

export default ThreeColumn;
