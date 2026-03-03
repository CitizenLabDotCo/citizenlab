import React from 'react';

import { Box, Icon, Text } from '@citizenlab/cl2-component-library';

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
          {node.type === 'folder' && (
            <Box display="flex" alignItems="flex-start">
              <Box
                display="flex"
                flexDirection="column"
                justifyContent="flex-start"
                h="100%"
              >
                <Icon
                  name="folder-outline"
                  mr="12px"
                  width="20px"
                  height="20px"
                  transform="translateY(1px)"
                />
              </Box>
              <Box>
                <Text m="0">{node.name}</Text>
                {node.children.map((child) => (
                  <Box
                    key={child.id}
                    display="flex"
                    alignItems="center"
                    mt="8px"
                  >
                    <Icon
                      name="projects"
                      mr="12px"
                      width="20px"
                      height="20px"
                    />
                    <Text m="0">{child.name}</Text>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
};

export default TreeView;
