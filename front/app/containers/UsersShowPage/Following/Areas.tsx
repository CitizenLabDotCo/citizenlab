import React from 'react';
import { Box } from '@citizenlab/cl2-component-library';
import Area from './Area';
import useAreas from 'api/areas/useAreas';

const Areas = () => {
  const { data: areas } = useAreas({});

  return (
    <Box display="flex" gap="20px" width="100%" flexWrap="wrap">
      {areas?.data.map((area) => (
        <Area area={area} key={area.id} />
      ))}
    </Box>
  );
};

export default Areas;
