import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { TreeNode, NodeType } from 'api/admin_publications/types';

import { MessageDescriptor } from 'utils/cl-intl';

import Folder from './Folder';
import Project from './Project';
import Space from './Space';

interface Props {
  nodes: TreeNode[];
  lockedProjectTooltip?: MessageDescriptor;
  lockedFolderTooltip?: MessageDescriptor;
  removeButtonMessage?: MessageDescriptor;
  onRemove?: (nodeId: string, nodeType: NodeType) => Promise<void>;
}

const TreeView = ({
  nodes,
  lockedProjectTooltip,
  lockedFolderTooltip,
  removeButtonMessage,
  onRemove,
}: Props) => {
  return (
    <Box maxWidth="800px">
      {nodes.map((node) => (
        <Box key={node.id}>
          {node.type === 'space' && (
            <Space
              node={node}
              lockedProjectTooltip={lockedProjectTooltip}
              lockedFolderTooltip={lockedFolderTooltip}
              removeButtonMessage={removeButtonMessage}
              onRemove={onRemove}
            />
          )}
          {node.type === 'folder' && (
            <Folder
              node={node}
              lockedProjectTooltip={lockedProjectTooltip}
              removeButtonMessage={removeButtonMessage}
              onRemove={onRemove}
            />
          )}
          {node.type === 'project' && (
            <Project
              node={node}
              removeButtonMessage={removeButtonMessage}
              onRemove={onRemove}
            />
          )}
        </Box>
      ))}
    </Box>
  );
};

export default TreeView;
