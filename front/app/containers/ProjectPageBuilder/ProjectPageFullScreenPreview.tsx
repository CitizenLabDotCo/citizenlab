import React from 'react';

import useParallelParticipation from 'hooks/useParallelParticipation';

import { useParams } from 'utils/router';

import FullScreenPreview from './FullScreenPreview';

export const ProjectPageFullScreenPreview = () => {
  const { projectId } = useParams({ strict: false }) as { projectId: string };
  const parallelParticipation = useParallelParticipation();

  if (!parallelParticipation) return null;

  return <FullScreenPreview projectId={projectId} />;
};

export default ProjectPageFullScreenPreview;
