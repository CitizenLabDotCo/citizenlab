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
      {[].map(({ id }) => (
        <MethodLabel projectLibraryPhaseId={id} key={id} />
      ))}
    </Box>
  );
};

export default ProjectCard;
