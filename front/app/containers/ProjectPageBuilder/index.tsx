import React, { useEffect, useRef } from 'react';

import useProjectPageLayout from 'api/content_builder/useProjectPageLayout';
import useUpsertProjectPageLayout from 'api/content_builder/useUpsertProjectPageLayout';
import useProjectById from 'api/projects/useProjectById';

import useParallelParticipation from 'hooks/useParallelParticipation';

import { defaultProjectPageLayout } from 'components/ProjectPageBuilder/defaultLayout';

import { useParams } from 'utils/router';

import ProjectPageBuilderPage from './ProjectPageBuilderPage';

const ProjectPageBuilder = () => {
  const { projectId } = useParams({ strict: false }) as { projectId: string };
  const parallelParticipation = useParallelParticipation();
  const { data: project } = useProjectById(projectId);
  const { isError } = useProjectPageLayout(projectId, parallelParticipation);
  const { mutate: upsertProjectPageLayout } = useUpsertProjectPageLayout();

  // A fresh project has no `project_page` layout yet (GET 404s). Create one
  // seeded with the locked Banner + Title on first open so the builder always
  // has the fixed header; further content is added by the admin and saved.
  const bootstrapped = useRef(false);
  useEffect(() => {
    if (parallelParticipation && isError && !bootstrapped.current) {
      bootstrapped.current = true;
      upsertProjectPageLayout({
        projectId,
        enabled: true,
        craftjs_json: defaultProjectPageLayout(),
      });
    }
  }, [parallelParticipation, isError, projectId, upsertProjectPageLayout]);

  if (!parallelParticipation || !project) return null;

  // Preserve the query string (e.g. ?parallel_participation) on the way back.
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
