import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';

// styles
import { colors } from 'utils/styleUtils';

// craft
import { useNode, useEditor, ROOT_NODE } from '@craftjs/core';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';

const RenderNode = ({ render }) => {
  const { isActive } = useEditor((_, query) => ({
    isActive: query.getEvent('selected').contains(id),
  }));

  const { id, name } = useNode((node) => ({
    name: node.data.custom.displayName || node.data.displayName,
  }));

  const nodeNameIsVisible = isActive && id !== ROOT_NODE;

  const getComponentNameMessage = (name: 'Container') => {
    switch (name) {
      case 'Container':
        return messages.oneColumn;
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
