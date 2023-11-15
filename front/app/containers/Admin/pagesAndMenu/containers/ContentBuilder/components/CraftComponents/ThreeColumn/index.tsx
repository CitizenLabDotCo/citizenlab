import React from 'react';

// components
import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';

// craft
import { Element, ROOT_NODE, useNode } from '@craftjs/core';

// i18n
import messages from './messages';
import Container from '../Container';

import {
  ThreeColumnWrapper,
  ThreeColumnSettings,
} from 'components/admin/ContentBuilder/Widgets/ThreeColumn';

const ThreeColumn = () => {
  const isSmallerThanTablet = useBreakpoint('tablet');
  const { parent } = useNode((node) => ({
    parent: node.data.parent,
  }));

  return (
    <ThreeColumnWrapper
      maxWidth="1150px"
      margin="0 auto"
      px={isSmallerThanTablet && parent === ROOT_NODE ? '20px' : '0px'}
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

ThreeColumn.craft = {
  related: {
    settings: ThreeColumnSettings,
  },
  custom: {
    title: messages.threeColumn,
    hasChildren: true,
  },
};

export default ThreeColumn;
