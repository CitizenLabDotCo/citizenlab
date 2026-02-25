import React from 'react';

import useAuthUser from 'api/me/useAuthUser';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { isAdmin } from 'utils/permissions/roles';

const Workspaces = () => {
  const workspacesEnabled = useFeatureFlag({ name: 'workspaces' });
  const { data: user } = useAuthUser();

  if (!workspacesEnabled || !isAdmin(user)) return null;

  return <div>Workspaces</div>;
};

export default Workspaces;
