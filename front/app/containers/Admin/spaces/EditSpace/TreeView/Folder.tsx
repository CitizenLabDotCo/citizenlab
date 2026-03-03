import React, { useState } from 'react';

import {
  Box,
  IconButton,
  Text,
  colors,
} from '@citizenlab/cl2-component-library';

import Project from './Project';
import { FolderNode } from './types';

interface Props {
  node: FolderNode;
}

const Folder = ({ node }: Props) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <Box display="flex" alignItems="flex-start" mt="12px">
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
              <Project key={child.id} node={child} />
            ))}
          </>
        )}
      </Box>
    </Box>
  );
};

export default Folder;
