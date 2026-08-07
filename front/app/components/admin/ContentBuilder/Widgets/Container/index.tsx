import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { UserComponent, useEditor } from '@craftjs/core';

import Events from 'containers/Admin/pagesAndMenu/containers/ContentBuilder/components/Widgets/Events';
import Projects from 'containers/Admin/pagesAndMenu/containers/ContentBuilder/components/Widgets/ProjectsAndFoldersLegacy';

const Container: UserComponent = ({ children }) => {
  const { enabled: inEditor } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  return (
    <Box
      className="e2e-single-column"
      minHeight={inEditor ? '40px' : undefined}
      w="100%"
    >
      {children}
    </Box>
  );
};

Container.craft = {
  rules: {
    canMoveIn: (incomingNodes) => {
      return !incomingNodes.some(
        (node) => node.data.type === Events || node.data.type === Projects
      );
    },
  },
};

export default Container;
