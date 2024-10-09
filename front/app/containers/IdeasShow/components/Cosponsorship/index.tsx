import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useFeatureFlag from 'hooks/useFeatureFlag';

import CosponsorsList from './CosponsorsList';
import RequestToCosponsor from './RequestToCosponsor';

const Cosponsorship = ({ ideaId }: { ideaId: string }) => {
  const isCosponsorshipEnabled = useFeatureFlag({
    name: 'input_cosponsorship',
  });

  if (!isCosponsorshipEnabled) {
    return null;
  }

  return (
    <Box display="flex" flexDirection="column" gap="20px">
      <RequestToCosponsor ideaId={ideaId} />
      <CosponsorsList ideaId={ideaId} />
    </Box>
  );
};

export default Cosponsorship;
