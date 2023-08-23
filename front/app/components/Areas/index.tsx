import React from 'react';
import { Box } from '@citizenlab/cl2-component-library';
import Area from './Area';
import useAreas from 'api/areas/useAreas';

interface Props {
  showHomePageAreas?: boolean;
}

const Areas = ({ showHomePageAreas = false }: Props) => {
  const { data: areas } = useAreas({ forHomepageFilter: showHomePageAreas });

  if (!areas || areas.data.length === 0) return null;

  return (
    <Box display="flex" gap="20px" width="100%" flexWrap="wrap">
      {areas.data.map((area) => (
        <Area area={area} key={area.id} />
      ))}
    </Box>
  );
};

export default Areas;
