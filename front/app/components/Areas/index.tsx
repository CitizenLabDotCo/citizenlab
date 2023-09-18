import React from 'react';
import { Box, Spinner } from '@citizenlab/cl2-component-library';
import UpdateFollowArea from './UpdateFollowArea';
import UpdateOnboardingArea from './UpdateOnboardingArea';
import useAreas from 'api/areas/useAreas';

interface Props {
  showOnboardingAreas?: boolean;
  action?: 'updateFollowPreferences' | 'updateOnboardingPreferences';
}

const Areas = ({
  showOnboardingAreas,
  action = 'updateFollowPreferences',
}: Props) => {
  const { data: areas, isLoading } = useAreas({
    forOnboarding: showOnboardingAreas,
    sort: 'projects_count',
  });

  if (isLoading) {
    return <Spinner />;
  }

  return areas && areas.data.length > 0 ? (
    <Box display="flex" gap="20px" width="100%" flexWrap="wrap">
      {areas.data.map((area) => {
        return action === 'updateOnboardingPreferences' ? (
          <UpdateOnboardingArea key={area.id} area={area} />
        ) : (
          <UpdateFollowArea key={area.id} area={area} />
        );
      })}
    </Box>
  ) : null;
};

export default Areas;
