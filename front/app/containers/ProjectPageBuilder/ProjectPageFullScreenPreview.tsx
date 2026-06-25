import React from 'react';

import useProjectById from 'api/projects/useProjectById';

import useParallelParticipation from 'hooks/useParallelParticipation';

import { useParams } from 'utils/router';

import FullScreenPreview from './FullScreenPreview';

export const ProjectPageFullScreenPreview = () => {
  const { projectId } = useParams({ strict: false }) as { projectId: string };
  const parallelParticipation = useParallelParticipation();
  const { data: project } = useProjectById(projectId);

  if (!parallelParticipation || !project) return null;

  return (
    <FullScreenPreview
      projectId={projectId}
      titleMultiloc={project.data.attributes.title_multiloc}
    />
  );
};

export default ProjectPageFullScreenPreview;
