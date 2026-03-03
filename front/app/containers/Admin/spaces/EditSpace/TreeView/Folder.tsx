import React, { useState } from 'react';

import {
  Box,
  Icon,
  IconButton,
  Text,
  colors,
} from '@citizenlab/cl2-component-library';

import { FolderNode } from './types';

interface Props {
  node: FolderNode;
}

const Folder = ({ node }: Props) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <Box display="flex" alignItems="flex-start">
      <Box display="flex">
        <IconButton
          mr="8px"
          ml="-7px"
          iconName={expanded ? 'chevron-down' : 'chevron-right'}
          iconWidth="20px"
          iconHeight="20px"
          iconColor={colors.black}
          transform="translateY(1px)"
          onClick={() => setExpanded(!expanded)}
          a11y_buttonActionMessage=""
        />
      </Box>
      <Box>
        <Text m="0">{node.name}</Text>
        {expanded && (
          <>
            {node.children.map((child) => (
              <Box key={child.id} display="flex" alignItems="center" mt="8px">
                <Icon name="projects" mr="12px" width="20px" height="20px" />
                <Text m="0">{child.name}</Text>
              </Box>
            ))}
          </>
        )}
      </Box>
    </Box>
  );
};

export default Folder;
