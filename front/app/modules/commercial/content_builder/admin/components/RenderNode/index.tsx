import React, { useEffect } from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';

// styles
import { colors } from 'utils/styleUtils';

// craft
import { useNode, useEditor, ROOT_NODE } from '@craftjs/core';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';

const CONTAINER = 'Container';
const TWO_COLUMNS = 'TwoColumn';

type ComponentNamesType = typeof CONTAINER | typeof TWO_COLUMNS;

export const getComponentNameMessage = (name: ComponentNamesType) => {
  switch (name) {
    case CONTAINER:
      return messages.oneColumn;
    case TWO_COLUMNS:
      return messages.twoColumn;
  }
};

const RenderNode = ({ render }) => {
  const {
    isActive,
    isDeletable,
    parentId,
    actions: { selectNode },
    query: { node },
  } = useEditor((_, query) => ({
    isActive: query.getEvent('selected').contains(id),
    parentId: id && query.node(id).ancestors()[0],
    isDeletable: id && query.node(id).isDeletable(),
  }));

  const { id, name } = useNode((node) => ({
    name: node.data.name as ComponentNamesType,
  }));

  useEffect(() => {
    if (isActive && parentId && name === CONTAINER) {
      const parentNode = node(parentId).get();
      parentNode.data.name === TWO_COLUMNS && selectNode(parentId);
    }
  });

  const nodeNameIsVisible = isActive && id !== ROOT_NODE && isDeletable;
  const isTwoColumn = name === TWO_COLUMNS;

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
          <FormattedMessage {...getComponentNameMessage(name)} />
        </Box>
      )}
      <Box
        border={`1px solid${
          nodeNameIsVisible
            ? colors.adminTextColor
            : !isTwoColumn
            ? colors.separation
            : undefined
        }`}
        m={!isTwoColumn ? '4px' : undefined}
      >
        {render}
      </Box>
    </Box>
  );
};

export default RenderNode;
