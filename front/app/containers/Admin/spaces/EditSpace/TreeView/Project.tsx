import React from 'react';

import { Box, Icon, colors } from '@citizenlab/cl2-component-library';

import Link from './Link';
import { ProjectNode } from './types';

interface Props {
  node: ProjectNode;
}

const Project = ({ node }: Props) => {
  return (
    <Box
      display="flex"
      alignItems="center"
      py="16px"
      borderBottom={`1px solid ${colors.divider}`}
    >
      <Icon
        name="projects"
        mr="12px"
        width="20px"
        height="20px"
        transform="translateY(-1px)"
      />
      <Link to={node.path}>{node.name}</Link>
    </Box>
  );
};

export default Project;
