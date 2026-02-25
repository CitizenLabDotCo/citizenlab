import React from 'react';

import useFeatureFlag from 'hooks/useFeatureFlag';

const WorkspacesMain = () => {
  const workspacesEnabled = useFeatureFlag({ name: 'workspaces' });
  if (!workspacesEnabled) return null;

  return (
    <div>
      <h1>Workspaces Settings</h1>
    </div>
  );
};

export default WorkspacesMain;
