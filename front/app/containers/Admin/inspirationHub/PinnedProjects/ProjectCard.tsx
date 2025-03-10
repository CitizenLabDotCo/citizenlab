import React from 'react';

import {
  Box,
  Title,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

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
          Test
        </Title>
      </Box>
    </Box>
  );
};

export default ProjectCard;
