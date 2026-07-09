import React, { useEffect, useRef } from 'react';

import useProjectPageLayout from 'api/project_page_layout/useProjectPageLayout';
import useUpsertProjectPageLayout from 'api/project_page_layout/useUpsertProjectPageLayout';
import useProjectById from 'api/projects/useProjectById';

import useParallelParticipation from 'hooks/useParallelParticipation';

import { useParams } from 'utils/router';

import ProjectPageBuilderPage from './ProjectPageBuilderPage';

const ProjectPageBuilder = () => {
  const { projectId } = useParams({ strict: false }) as { projectId: string };
  const parallelParticipation = useParallelParticipation();
  const { data: project } = useProjectById(projectId);
  const { isError } = useProjectPageLayout(projectId, parallelParticipation);
  const { mutate: upsertProjectPageLayout } = useUpsertProjectPageLayout();

  const bootstrappedProjectId = useRef<string>();
  useEffect(() => {
    if (
      parallelParticipation &&
      isError &&
      bootstrappedProjectId.current !== projectId
    ) {
      bootstrappedProjectId.current = projectId;
      upsertProjectPageLayout({ projectId, enabled: true });
    }
  }, [parallelParticipation, isError, projectId, upsertProjectPageLayout]);

  if (!parallelParticipation || !project) return null;

  const backPath = `/admin/projects/${projectId}/project-page${window.location.search}`;

  return (
    <ProjectPageBuilderPage
      projectId={projectId}
      backPath={backPath}
      previewLink={{
        to: '/projects/$slug',
        params: { slug: project.data.attributes.slug },
      }}
      titleMultiloc={project.data.attributes.title_multiloc}
    />
  );
};

export default ProjectPageBuilder;
