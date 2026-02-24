import React from 'react';

import { useParams } from 'utils/router';

import useProjectById from 'api/projects/useProjectById';

import FullScreenPreview from 'containers/DescriptionBuilder/FullScreenPreview';

export const ProjectFullScreenPreview = () => {
  const { projectId } = useParams({ strict: false }) as { projectId: string };
  const { data: project } = useProjectById(projectId);

  if (!project) return null;
  if (!project.data.attributes.uses_content_builder) return null;

  return (
    <FullScreenPreview
      contentBuildableId={projectId}
      contentBuildableType="project"
      titleMultiloc={project.data.attributes.title_multiloc}
    />
  );
};

export default ProjectFullScreenPreview;
