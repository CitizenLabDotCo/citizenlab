import React from 'react';
import { Box, Spinner } from '@citizenlab/cl2-component-library';
import Area from './Area';
import useAreas from 'api/areas/useAreas';

interface Props {
  showHomePageAreas?: boolean;
}

const Areas = ({ showHomePageAreas = false }: Props) => {
  const { data: areas, isLoading } = useAreas({
    forHomepageFilter: showHomePageAreas,
    sort: 'projects_count',
  });

  if (isLoading) {
    return <Spinner />;
  }

  return areas && areas.data.length > 0 ? (
    <Box display="flex" gap="20px" width="100%" flexWrap="wrap">
      {areas.data.map((area) => (
        <Area area={area} key={area.id} />
      ))}
    </Box>
  ) : null;
};

export default Areas;
