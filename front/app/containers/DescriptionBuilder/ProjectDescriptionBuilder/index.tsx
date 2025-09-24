import React from 'react';
import useProjectById from 'api/projects/useProjectById';
import { isNilOrError } from 'utils/helperUtils';
import DescriptionBuilderPage from 'containers/DescriptionBuilder/index';
import { useParams } from 'react-router-dom';

const ProjectDescriptionBuilderPage = () => {
  const { projectId } = useParams() as { projectId: string };
  const { data: project } = useProjectById(projectId);

  if (isNilOrError(project)) return null;

  return (
    <DescriptionBuilderPage
      modelId={projectId}
      modelType="project"
      backPath={`/admin/projects/${projectId}/general`}
      previewPath={`/projects/${project.data.attributes.slug}`}
      titleMultiloc={project.data.attributes.title_multiloc}
    />
  );
};

export default ProjectDescriptionBuilderPage;
