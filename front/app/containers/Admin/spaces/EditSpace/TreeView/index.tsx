import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import Folder from './Folder';
import Project from './Project';
import { TreeNode } from './types';

interface Props {
  nodes: TreeNode[];
}

const TreeView = ({ nodes }: Props) => {
  return (
    <Box>
      {nodes.map((node) => (
        <Box key={node.id}>
          {node.type === 'project' && <Project node={node} />}
          {node.type === 'folder' && <Folder node={node} />}
        </Box>
      ))}
    </Box>
  );
};

export default TreeView;
