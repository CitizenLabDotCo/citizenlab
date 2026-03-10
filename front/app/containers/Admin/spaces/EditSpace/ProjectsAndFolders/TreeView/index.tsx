import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { TreeNode } from 'api/spaces/types';

import Folder from './Folder';
import Project from './Project';

interface Props {
  nodes: TreeNode[];
}

const TreeView = ({ nodes }: Props) => {
  return (
    <Box maxWidth="800px">
      {nodes.map((node) => (
        <Box key={node.id}>
          {node.type === 'project' && <Project node={node} removable />}
          {node.type === 'folder' && <Folder node={node} />}
        </Box>
      ))}
    </Box>
  );
};

export default TreeView;
