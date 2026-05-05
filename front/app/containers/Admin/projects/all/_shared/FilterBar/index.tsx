import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';
import { IUser } from 'api/users/types';

import { isAdmin, isSpaceModerator } from 'utils/permissions/roles';
import { isProjectFolderModerator } from 'utils/permissions/rules/projectFolderPermissions';

import DynamicFilters from './DynamicFilters';
import Dates from './Filters/Dates';
import PendingApproval from './Filters/PendingApproval';
import Sort from './Filters/Sort';

const userCanApprove = (user: IUser) => {
  return (
    isAdmin(user) || isSpaceModerator(user) || isProjectFolderModerator(user)
  );
};

const Filters = () => {
  const { data: user } = useAuthUser();
  if (!user) return null;

  return (
    <Box
      display="flex"
      flexDirection="row"
      flexWrap="wrap"
      gap="8px"
      alignItems="center"
      className="intercom-product-tour-project-page-filters"
    >
      <Sort />
      {userCanApprove(user) && <PendingApproval />}
      <Dates />
      <DynamicFilters />
    </Box>
  );
};

export default Filters;
