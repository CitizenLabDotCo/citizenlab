import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { TreeNode } from 'api/spaces/types';

import { MessageDescriptor } from 'utils/cl-intl';

import Folder from './Folder';
import Project from './Project';

interface Props {
  nodes: TreeNode[];
  lockedProjectTooltip?: MessageDescriptor;
  removeButtonMessage: MessageDescriptor;
}

const TreeView = ({
  nodes,
  lockedProjectTooltip,
  removeButtonMessage,
}: Props) => {
  return (
    <Box maxWidth="800px">
      {nodes.map((node) => (
        <Box key={node.id}>
          {node.type === 'project' && (
            <Project node={node} removeButtonMessage={removeButtonMessage} />
          )}
          {node.type === 'folder' && (
            <Folder
              node={node}
              lockedProjectTooltip={lockedProjectTooltip}
              removeButtonMessage={removeButtonMessage}
            />
          )}
        </Box>
      ))}
    </Box>
  );
};

export default TreeView;
