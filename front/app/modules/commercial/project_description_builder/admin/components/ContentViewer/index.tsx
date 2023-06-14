import React, { useEffect } from 'react';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';

// hooks
import useProjectBySlug from 'api/projects/useProjectBySlug';
import useFeatureFlag from 'hooks/useFeatureFlag';

// components
import Viewer from './Viewer';

type ContentViewerProps = {
  onMount: () => void;
} & WithRouterProps;

const ContentViewer = ({ onMount, params: { slug } }: ContentViewerProps) => {
  const { data: project } = useProjectBySlug(slug);
  const featureEnabled = useFeatureFlag({
    name: 'project_description_builder',
  });

  useEffect(() => {
    if (!featureEnabled) return;
    onMount();
  }, [onMount, featureEnabled]);

  if (!featureEnabled || !project) {
    return null;
  }

  return (
    <Viewer
      projectId={project.data.id}
      projectTitle={project.data.attributes.title_multiloc}
    />
  );
};

export default withRouter(ContentViewer);
