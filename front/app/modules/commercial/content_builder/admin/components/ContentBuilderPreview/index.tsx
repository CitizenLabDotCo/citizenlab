import React, { useEffect } from 'react';
import { withRouter, WithRouterProps } from 'react-router';

// Hooks
import useProject from 'hooks/useProject';
import useFeatureFlag from 'hooks/useFeatureFlag';

// Components
import { Box } from '@citizenlab/cl2-component-library';
import ProjectInfo from 'containers/ProjectsShowPage/shared/header/ProjectInfo';
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

  if (!featureEnabled) {
    return null;
  }

  if (isNilOrError(project)) return null;

  return (
    <Box>
      <div>preview</div>
      <ProjectInfo projectId={project.id} />
    </Box>
  );
};

export default withRouter(ContentBuilderPreview);
