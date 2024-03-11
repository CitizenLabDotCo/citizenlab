import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useEditor } from '@craftjs/core';

const DraggableInsight = ({
  id,
  component,
  children,
}: {
  id: string;
  component: React.ReactElement;
  children?: React.ReactNode;
}) => {
  const {
    connectors,
    actions: { selectNode },
  } = useEditor();

  return (
    <Box
      id={id}
      ref={(ref) =>
        ref &&
        connectors.create(ref, component, {
          onCreate: (node) => {
            selectNode(node.rootNodeId);
          },
        })
      }
    >
      {children}
    </Box>
  );
};

export default DraggableInsight;
