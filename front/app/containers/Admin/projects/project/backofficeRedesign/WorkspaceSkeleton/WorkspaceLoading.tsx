import React, { ReactNode } from 'react';

import useProjectBackofficeRedesign from 'hooks/useProjectBackofficeRedesign';

import { useLocation } from 'utils/router';

import WorkspaceSkeleton from '.';

interface Props {
  // What the old back office shows while the project loads.
  fallback: ReactNode;
}

const WorkspaceLoading = ({ fallback }: Props) => {
  const redesign = useProjectBackofficeRedesign();
  const { pathname } = useLocation();

  if (!redesign) return <>{fallback}</>;

  return <WorkspaceSkeleton inPhase={/\/phases\/[^/]+/.test(pathname)} />;
};

export default WorkspaceLoading;
