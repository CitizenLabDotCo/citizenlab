import React from 'react';
import { Box } from '@citizenlab/cl2-component-library';
import { colors } from 'utils/styleUtils';

import { useNode, useEditor, ROOT_NODE } from '@craftjs/core';

export const RenderNode = ({ render }) => {
  const { query, isActive } = useEditor((_, query) => ({
    isActive: query.getEvent('selected').contains(id),
  }));

  const { id, name } = useNode((node) => ({
    isHover: node.events.hovered,
    dom: node.dom,
    name: node.data.custom.displayName || node.data.displayName,
    moveable: query.node(node.id).isDraggable(),
    deletable: query.node(node.id).isDeletable(),
    parent: node.data.parent,
    props: node.data.props,
  }));

  const nodeNameIsVisible = isActive && id !== ROOT_NODE;
  return (
    <Box position="relative">
      {nodeNameIsVisible && (
        <Box
          p="4px"
          bgColor={colors.adminTextColor}
          color="#fff"
          position="absolute"
          top="0px"
          left="4px"
        >
          {name}
        </Box>
      )}
      <Box
        border={`1px solid${
          nodeNameIsVisible ? colors.adminTextColor : colors.separation
        }`}
        m="4px"
      >
        {render}
      </Box>
    </Box>
  );
};

export default RenderNode;
