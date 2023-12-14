import React from 'react';

// components
import { Box, colors } from '@citizenlab/cl2-component-library';
import GoBackButton from 'components/UI/GoBackButton';

interface Props {
  onClick: () => void;
}

const GoBackButtonWrapped = ({ onClick }: Props) => (
  <Box
    p="15px"
    w="210px"
    h="100%"
    borderRight={`1px solid ${colors.grey500}`}
    display="flex"
    alignItems="center"
  >
    <GoBackButton onClick={onClick} />
  </Box>
);

export default GoBackButtonWrapped;
