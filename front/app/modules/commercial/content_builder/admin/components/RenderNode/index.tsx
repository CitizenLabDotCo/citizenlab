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
const TEXT = 'Text';

type ComponentNamesType = typeof CONTAINER | typeof TWO_COLUMNS | typeof TEXT;

export const getComponentNameMessage = (name: ComponentNamesType) => {
  switch (name) {
    case CONTAINER:
      return messages.oneColumn;
    case TWO_COLUMNS:
      return messages.twoColumn;
    case TEXT:
      return messages.text;
  }
};

const RenderNode = ({ render }) => {
  const {
    isActive,
    isHover,
    isDeletable,
    parentId,
    actions: { selectNode },
    query: { node },
  } = useEditor((_, query) => ({
    isActive: query.getEvent('selected').contains(id),
    isHover: query.getEvent('hovered').contains(id),
    parentId: id && query.node(id).ancestors()[0],
    isDeletable: id && query.node(id).isDeletable(),
  }));

  const { id, name } = useNode((node) => ({
    name: node.data.name as ComponentNamesType,
  }));

  const parentNode = parentId && node(parentId).get();

  useEffect(() => {
    if (isActive && name === CONTAINER && parentNode) {
      parentNode.data.name === TWO_COLUMNS && selectNode(parentId);
    }
  });

  const nodeNameIsVisible = isActive && id !== ROOT_NODE && isDeletable;
  const isTwoColumn = name === TWO_COLUMNS;
  const twoColumnsIsHover =
    (name === TWO_COLUMNS && isHover) ||
    (parentNode &&
      name === CONTAINER &&
      isHover &&
      parentNode.data.name === TWO_COLUMNS);
  console.log({ name, twoColumnsIsHover, isHover });

  return (
    <Box position="relative">
      {nodeNameIsVisible && (
        <Box
          p="4px"
          bgColor={colors.adminTextColor}
          color="#fff"
          position="absolute"
          top="-27px"
          left="4px"
        >
          <FormattedMessage {...getComponentNameMessage(name)} />
        </Box>
      )}
      <Box
        border={`1px ${
          nodeNameIsVisible || isHover || isTwoColumn
            ? `solid ${colors.adminTextColor}`
            : !isTwoColumn
            ? `dashed ${colors.separation}`
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
