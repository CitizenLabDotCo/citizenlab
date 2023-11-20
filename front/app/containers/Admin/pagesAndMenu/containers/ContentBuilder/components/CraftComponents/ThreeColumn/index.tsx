import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';

// craft
import { Element } from '@craftjs/core';

// i18n
import Container from '../Container';

import {
  ThreeColumnWrapper,
  threeColumnCraftConfig,
} from 'components/admin/ContentBuilder/Widgets/ThreeColumn';
import usePx from 'components/admin/ContentBuilder/Widgets/usePx';

const ThreeColumn = () => {
  const px = usePx();

  return (
    <ThreeColumnWrapper maxWidth="1150px" margin="0 auto" px={px}>
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

ThreeColumn.craft = threeColumnCraftConfig;

export default ThreeColumn;
