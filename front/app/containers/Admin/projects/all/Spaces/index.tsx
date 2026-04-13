import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { isAdmin, isSpaceModerator } from 'utils/permissions/roles';

import Table from './Table';

const Spaces = () => {
  const spacesEnabled = useFeatureFlag({ name: 'spaces' });
  const { data: user } = useAuthUser();

  if (!spacesEnabled) return null;

  if (isAdmin(user) || isSpaceModerator(user)) {
    return (
      <Box>
        <Table />
      </Box>
    );
  }

  return null;
};

export default Spaces;
