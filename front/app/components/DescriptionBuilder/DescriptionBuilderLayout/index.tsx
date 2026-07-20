import React, { useEffect } from 'react';

import { useLocation } from 'utils/router';

type DescriptionBuilderLayoutProps = {
  children?: React.ReactNode;
  onMount: (isVisible: boolean) => void;
};

const DescriptionBuilderLayout: React.FC<DescriptionBuilderLayoutProps> = ({
  children,
  onMount,
}) => {
  const { pathname } = useLocation();
  const projectDescriptionBuilderLayoutVisible = pathname.includes(
    'admin/project-description-builder'
  );

  useEffect(() => {
    onMount(projectDescriptionBuilderLayoutVisible);
  }, [onMount, projectDescriptionBuilderLayoutVisible]);

  if (!projectDescriptionBuilderLayoutVisible) {
    return null;
  }

  return <>{children}</>;
};

export default DescriptionBuilderLayout;
