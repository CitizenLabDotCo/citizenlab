import React from 'react';

import useProjectById from 'api/projects/useProjectById';

import useFeatureFlag from 'hooks/useFeatureFlag';

import DescriptionBuilderPage from 'containers/DescriptionBuilder/index';

import { useParams } from 'utils/router';

const ProjectDescriptionBuilderPage = () => {
  const { projectId } = useParams({ strict: false }) as { projectId: string };
  const { data: project } = useProjectById(projectId);
  // In the redesigned back office the description builder is opened from the
  // "Project page" section, so return there; otherwise fall back to the
  // legacy general-settings entry point.
  const parallelParticipation = useFeatureFlag({
    name: 'parallel_participation',
  });

  if (!project) return null;
  if (!project.data.attributes.uses_content_builder) return null;

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
