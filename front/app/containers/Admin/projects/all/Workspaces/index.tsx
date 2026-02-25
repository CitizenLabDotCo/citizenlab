import React from 'react';

import useFeatureFlag from 'hooks/useFeatureFlag';

const Workspaces = () => {
  const workspacesEnabled = useFeatureFlag({ name: 'workspaces' });
  if (!workspacesEnabled) return null;

  return <div>Workspaces</div>;
};

export default Workspaces;
