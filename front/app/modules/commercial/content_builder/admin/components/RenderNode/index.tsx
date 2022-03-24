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
    name: node.data.custom.displayName || node.data.displayName,
  }));

  useEffect(() => {
    if (isActive && parentId && name === CONTAINER) {
      const parentNode = node(parentId).get();
      parentNode.data.name === TWO_COLUMNS && selectNode(parentId);
    }
  });

  const nodeNameIsVisible = isActive && id !== ROOT_NODE && isDeletable;

  const getComponentNameMessage = (
    name: typeof CONTAINER | typeof TWO_COLUMNS
  ) => {
    switch (name) {
      case CONTAINER:
        return messages.oneColumn;
      case TWO_COLUMNS:
        return messages.twoColumn;
    }
  };

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
      {name !== TWO_COLUMNS ? (
        <Box
          border={`1px solid${
            nodeNameIsVisible ? colors.adminTextColor : colors.separation
          }`}
          m="4px"
        >
          {render}
        </Box>
      ) : (
        render
      )}
    </Box>
  );
};

export default RenderNode;
