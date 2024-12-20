import React from 'react';

import {
  Box,
  colors,
  stylingConsts,
  Text,
} from '@citizenlab/cl2-component-library';

import useProjectById from 'api/projects/useProjectById';

import T from 'components/T';

interface Props {
  projectId: string;
}

const ProjectSelector = ({ projectId }: Props) => {
  const { data: project } = useProjectById(projectId);

  if (!project) return null;

  return (
    <Box
      // inline-block is needed to make the top/bottom padding work
      display="inline-block"
      border={`1px solid ${colors.teal}`}
      borderRadius={stylingConsts.borderRadius}
      p="2px 8px"
    >
      <Text as="span" m="0" fontWeight="semi-bold" fontSize="xs" color="teal">
        <T value={project.data.attributes.title_multiloc} />
      </Text>
    </Box>
  );
};

export default ProjectSelector;
