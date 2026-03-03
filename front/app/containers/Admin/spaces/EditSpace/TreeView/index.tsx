import React from 'react';

import { Box, Icon, Text } from '@citizenlab/cl2-component-library';

import Folder from './Folder';
import { TreeNode } from './types';

interface Props {
  nodes: TreeNode[];
}

const TreeView = ({ nodes }: Props) => {
  return (
    <Box>
      {nodes.map((node) => (
        <Box key={node.id} mb="12px">
          {node.type === 'project' && (
            <Box display="flex" alignItems="center">
              <Icon name="projects" mr="12px" width="20px" height="20px" />
              <Text m="0">{node.name}</Text>
            </Box>
          )}
          {node.type === 'folder' && <Folder node={node} />}
        </Box>
      ))}
    </Box>
  );
};

export default TreeView;
