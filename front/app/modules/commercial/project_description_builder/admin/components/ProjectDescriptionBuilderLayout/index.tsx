import React, { useEffect } from 'react';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';

type ProjectDescriptionBuilderLayoutProps = {
  children?: React.ReactNode;
  onMount: (isVisible: boolean) => void;
} & WithRouterProps;

const ProjectDescriptionBuilderLayout: React.FC<
  ProjectDescriptionBuilderLayoutProps
> = ({ children, onMount, location: { pathname } }) => {
  const featureEnabled = useFeatureFlag({
    name: 'project_description_builder',
  });
  const projectDescriptionBuilderLayoutVisible =
    featureEnabled && pathname.includes('admin/project-description-builder');

  useEffect(() => {
    onMount(projectDescriptionBuilderLayoutVisible);
  }, [onMount, projectDescriptionBuilderLayoutVisible]);

  if (!projectDescriptionBuilderLayoutVisible) {
    return null;
  }

  return <>{children}</>;
};

export default withRouter(ProjectDescriptionBuilderLayout);
