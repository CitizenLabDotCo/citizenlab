import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';

import { isAdmin } from 'utils/permissions/roles';

import DynamicFilters from './DynamicFilters';
import Dates from './Filters/Dates';
import PendingApproval from './Filters/PendingApproval';
import Sort from './Filters/Sort';

const Filters = () => {
  const { data: user } = useAuthUser();
  const isUserAdmin = isAdmin(user);

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
      {isUserAdmin && <PendingApproval />}
      <Dates />
      <DynamicFilters isUserAdmin={isUserAdmin} />
    </Box>
  );
};

export default Filters;
