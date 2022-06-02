import React, { useEffect } from 'react';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';

// hooks
import useProject from 'hooks/useProject';
import useFeatureFlag from 'hooks/useFeatureFlag';

// components
import Preview from './Preview';

// utils
import { isNilOrError } from 'utils/helperUtils';

type ContentBuilderPreviewProps = {
  onMount: () => void;
} & WithRouterProps;

const ContentBuilderPreview = ({
  onMount,
  params: { slug },
}: ContentBuilderPreviewProps) => {
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
    <Preview
      projectId={project.id}
      projectTitle={project.attributes.title_multiloc}
    />
  );
};

export default withRouter(ContentBuilderPreview);
