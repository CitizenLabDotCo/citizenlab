import React from 'react';

import useProjectById from 'api/projects/useProjectById';

import useParallelParticipation from 'hooks/useParallelParticipation';

import DescriptionBuilderPage from 'containers/DescriptionBuilder/index';

import { useParams } from 'utils/router';

const ProjectDescriptionBuilderPage = () => {
  const { projectId } = useParams({ strict: false }) as { projectId: string };
  const { data: project } = useProjectById(projectId);
  const parallelParticipation = useParallelParticipation();

  if (!project) return null;

  const backPath = parallelParticipation
    ? `/admin/projects/${projectId}/project-page`
    : `/admin/projects/${projectId}/general`;

  return (
    <DescriptionBuilderPage
      contentBuildableId={projectId}
      contentBuildableType="project"
      backPath={backPath}
      previewLink={{
        to: '/projects/$slug',
        params: { slug: project.data.attributes.slug },
      }}
      titleMultiloc={project.data.attributes.title_multiloc}
    />
  );
};

export default ProjectDescriptionBuilderPage;
