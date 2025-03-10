import React from 'react';

import {
  Box,
  Text,
  Title,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

import MethodLabel from '../MethodLabel';

import CardImage from './CardImage';

const PHASE_RELATIONS = [
  {
    id: '18c07de2-8834-4e5f-a355-7328014492dd',
    type: 'project_library_phase',
  },
  {
    id: 'b7e04837-28f6-43d1-a59e-469fab7e0fb3',
    type: 'project_library_phase',
  },
  {
    id: 'd440ad54-61ad-49dd-856a-88ee5f625375',
    type: 'project_library_phase',
  },
];

const ProjectCard = () => {
  return (
    <Box
      bgColor={colors.white}
      borderRadius={stylingConsts.borderRadius}
      w="33%"
      p="16px"
    >
      <Box>
        <CardImage />
      </Box>
      <Box>
        <Title variant="h3" color="primary" mt="12px">
          Project name
        </Title>
      </Box>
      <Text color="primary" fontSize="s">
        Tenant
      </Text>
      {PHASE_RELATIONS.map(({ id }) => (
        <MethodLabel projectLibraryPhaseId={id} key={id} />
      ))}
    </Box>
  );
};

export default ProjectCard;
