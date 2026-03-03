import React from 'react';

import { Box, Icon, Text } from '@citizenlab/cl2-component-library';

import { ProjectNode } from './types';

interface Props {
  node: ProjectNode;
}

const Project = ({ node }: Props) => {
  return (
    <Box display="flex" alignItems="center" mt="12px">
      <Icon name="projects" mr="12px" width="20px" height="20px" />
      <Text m="0">{node.name}</Text>
    </Box>
  );
};

export default Project;
