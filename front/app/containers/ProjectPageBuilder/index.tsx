import React, { useEffect, useRef } from 'react';

import useProjectPageLayout from 'api/project_page_layout/useProjectPageLayout';
import useUpsertProjectPageLayout from 'api/project_page_layout/useUpsertProjectPageLayout';
import useProjectById from 'api/projects/useProjectById';

import { useParams } from 'utils/router';

import ProjectPageBuilderPage from './ProjectPageBuilderPage';

const ProjectPageBuilder = () => {
  const { projectId } = useParams({ strict: false }) as { projectId: string };
  const { data: project } = useProjectById(projectId);
  const { isError } = useProjectPageLayout(projectId);
  const { mutate: upsertProjectPageLayout } = useUpsertProjectPageLayout();

  const bootstrappedProjectId = useRef<string>();
  useEffect(() => {
    if (isError && bootstrappedProjectId.current !== projectId) {
      bootstrappedProjectId.current = projectId;
      upsertProjectPageLayout({ projectId, enabled: true });
    }
  }, [isError, projectId, upsertProjectPageLayout]);

  if (!project) return null;

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
