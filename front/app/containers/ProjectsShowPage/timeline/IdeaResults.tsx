import React from 'react';

import useIdeas from 'api/ideas/useIdeas';

// components
import { Box } from '@citizenlab/cl2-component-library';

interface Props {
  phaseId: string;
}

const IdeaResults = ({ phaseId }: Props) => {
  const { data: ideas } = useIdeas({
    phase: phaseId,
    sort: 'baskets_count', // TODO: replace with votes_count when implemented by James
  });

  return <Box mt="20px">RESULTS TEST</Box>;
};

export default IdeaResults;
