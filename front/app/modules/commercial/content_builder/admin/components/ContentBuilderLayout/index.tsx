import React, { useEffect } from 'react';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

// intl
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';

type ContentBuilderLayoutProps = {
  children?: React.ReactNode;
  onMount: (isVisible: boolean) => void;
} & WithRouterProps;

const ContentBuilderLayout: React.FC<ContentBuilderLayoutProps> = ({
  children,
  onMount,
  location: { pathname },
}) => {
  const featureEnabled = useFeatureFlag({
    name: 'project_description_builder',
  });
  const contentBuilderLayoutVisible =
    featureEnabled && pathname.includes('admin/project-description-builder');

  useEffect(() => {
    onMount(contentBuilderLayoutVisible);
  }, [onMount, contentBuilderLayoutVisible]);

  if (!contentBuilderLayoutVisible) {
    return null;
  }

  return <>{children}</>;
};

export default withRouter(ContentBuilderLayout);
