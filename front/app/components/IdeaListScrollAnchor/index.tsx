import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

const IdeaListScrollAnchor = () => {
  return (
    <Box
      position="absolute"
      mt="-150px"
      id="ideas-list-scroll-anchor"
      aria-hidden={true}
    />
  );
};

export default IdeaListScrollAnchor;
