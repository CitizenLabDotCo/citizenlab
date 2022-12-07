import React, { useEffect } from 'react';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';

// hooks
import useProject from 'hooks/useProject';
import useFeatureFlag from 'hooks/useFeatureFlag';

// components
import Viewer from './Viewer';

// utils
import { isNilOrError } from 'utils/helperUtils';

type ContentViewerProps = {
  onMount: () => void;
} & WithRouterProps;

const ContentViewer = ({ onMount, params: { slug } }: ContentViewerProps) => {
  const project = useProject({ projectSlug: slug });
  const featureEnabled = useFeatureFlag({ name: 'content_builder' });

  useEffect(() => {
    if (!featureEnabled) return;
    onMount();
  }, [onMount, featureEnabled]);

  if (!featureEnabled || isNilOrError(project)) {
    return null;
  }

  return (
    <Viewer
      projectId={project.id}
      projectTitle={project.attributes.title_multiloc}
    />
  );
};

export default withRouter(ContentViewer);
