import React from 'react';

import { useParams } from 'utils/router';

import FullScreenPreview from './FullScreenPreview';

export const ProjectPageFullScreenPreview = () => {
  const { projectId } = useParams({ strict: false }) as { projectId: string };

  return <FullScreenPreview projectId={projectId} />;
};

export default ProjectPageFullScreenPreview;
