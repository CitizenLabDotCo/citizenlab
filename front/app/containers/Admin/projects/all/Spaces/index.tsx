import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { usePermission } from 'utils/permissions';

import Table from './Table';

const Spaces = () => {
  const spacesEnabled = useFeatureFlag({ name: 'spaces' });
  const canManageSpaces = usePermission({
    item: 'space',
    action: 'manage_projects_and_folders',
  });

  if (!spacesEnabled || !canManageSpaces) return null;

  return (
    <Box>
      <Table />
    </Box>
  );
};

export default Spaces;
