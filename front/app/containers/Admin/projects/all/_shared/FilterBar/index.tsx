import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';
import { HighestRole, IUser } from 'api/users/types';

import DynamicFilters from './DynamicFilters';
import Dates from './Filters/Dates';
import PendingApproval from './Filters/PendingApproval';
import Sort from './Filters/Sort';

const userCanApprove = (user: IUser) => {
  const { highest_role } = user.data.attributes;

  const allowedHighestRoles: (string | undefined)[] = [
    'super_admin',
    'admin',
    'space_moderator',
    'project_folder_moderator',
  ] satisfies HighestRole[];
  return allowedHighestRoles.includes(highest_role);
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
