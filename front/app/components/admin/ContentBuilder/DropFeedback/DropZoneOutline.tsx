import React from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';
import useIsDragging from './useIsDragging';

const DropZoneOutline = () => {
  const isDragging = useIsDragging();

  if (!isDragging) return null;

  return (
    <Box
      position="absolute"
      top="0px"
      left="0px"
      w="100%"
      h="100%"
      border={`2px dashed ${colors.green500}`}
      // Widgets are wrapped in positioned elements, and a colored section
      // bleeds past the page column, so the outline has to be lifted over them
      // to stay visible on its left and right edges.
      zIndex="1"
      pointerEvents="none"
      data-cy="drop-zone-outline"
    >
      <Box
        position="absolute"
        top="-11px"
        right="8px"
        px="8px"
        py="1px"
        borderRadius="10px"
        bgColor={colors.green100}
      >
        <Text
          m="0px"
          fontSize="xs"
          fontWeight="bold"
          color="green700"
          whiteSpace="nowrap"
          style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
        >
          <FormattedMessage {...messages.dropZoneTag} />
        </Text>
      </Box>
    </Box>
  );
};

export default DropZoneOutline;
