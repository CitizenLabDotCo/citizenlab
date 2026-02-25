import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { isAdmin } from 'utils/permissions/roles';

import Table from './Table';

const Workspaces = () => {
  const workspacesEnabled = useFeatureFlag({ name: 'workspaces' });
  const { data: user } = useAuthUser();

  if (!workspacesEnabled || !isAdmin(user)) return null;

  return (
    <Box>
      <Table />
    </Box>
  );
};

export default Workspaces;
