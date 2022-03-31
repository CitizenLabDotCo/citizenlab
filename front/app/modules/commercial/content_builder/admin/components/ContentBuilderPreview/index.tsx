import React, { useEffect } from 'react';
import { withRouter, WithRouterProps } from 'react-router';

// Hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

// Components
import { Box } from '@citizenlab/cl2-component-library';

type ContentBuilderPreviewProps = {
  onMount: () => void;
} & WithRouterProps;

const ContentBuilderPreview = ({ onMount }: ContentBuilderPreviewProps) => {
  const featureEnabled = useFeatureFlag({ name: 'content_builder' });

  useEffect(() => {
    if (!featureEnabled) return;
    onMount();
  }, [onMount, featureEnabled]);

  if (!featureEnabled) {
    return null;
  }

  return <Box>preview</Box>;
};

export default withRouter(ContentBuilderPreview);
