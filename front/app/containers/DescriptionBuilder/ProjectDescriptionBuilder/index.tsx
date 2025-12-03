import React from 'react';

import { useParams } from 'react-router-dom';

import useProjectById from 'api/projects/useProjectById';

import DescriptionBuilderPage from 'containers/DescriptionBuilder/index';

const ProjectDescriptionBuilderPage = () => {
  const { projectId } = useParams() as { projectId: string };
  const { data: project } = useProjectById(projectId);

  if (!project) return null;
  if (!project.data.attributes.uses_content_builder) return null;

  return (
    <DescriptionBuilderPage
      contentBuildableId={projectId}
      contentBuildableType="project"
      backPath={`/admin/projects/${projectId}/general`}
      previewPath={`/projects/${project.data.attributes.slug}`}
      titleMultiloc={project.data.attributes.title_multiloc}
    />
  );
};

export default ProjectDescriptionBuilderPage;
