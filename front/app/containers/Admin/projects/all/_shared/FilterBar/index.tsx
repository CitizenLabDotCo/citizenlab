import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';
import { IUser } from 'api/users/types';

import { trackEventByName } from 'utils/analytics';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { isAdmin, isSpaceModerator } from 'utils/permissions/roles';
import { isProjectFolderModerator } from 'utils/permissions/rules/projectFolderPermissions';

import { countActiveFilters } from '../activeFilters';
import FilteredProjectCount from '../FilteredProjectCount';
import { Parameter, useParams } from '../params';

import ClearFiltersButton from './ClearFiltersButton';
import { FILTER_KEYS } from './constants';
import DynamicFilters from './DynamicFilters';
import Dates from './Filters/Dates';
import PendingApproval from './Filters/PendingApproval';
import Sort from './Filters/Sort';
import tracks from './tracks';

const DEFAULT_FILTERS: Parameter[] = [
  'review_state',
  'min_start_date',
  'max_start_date',
];

const userCanApprove = (user: IUser) => {
  return (
    isAdmin(user) || isSpaceModerator(user) || isProjectFolderModerator(user)
  );
};

interface Props {
  user: IUser;
}

const FilterBar = ({ user }: Props) => {
  const params = useParams();

  const [activeFilters, setActiveFilters] = useState(() => {
    return FILTER_KEYS.filter((key) => {
      const paramValue = params[key];

      if (!isAdmin(user) && key === 'managers') {
        return false; // Skip manager filter for non-admin users
      }

      return paramValue !== undefined && paramValue.length > 0;
    });
  });

  const showClearButton =
    activeFilters.length > 0 || countActiveFilters(params, undefined) > 0;

  const handleClearAll = () => {
    // Clear all parameters
    removeSearchParams([
      ...activeFilters,
      ...DEFAULT_FILTERS,
      'sort',
      'search',
    ]);
    // Clear all active filters
    setActiveFilters([]);

    trackEventByName(tracks.clearFilters);
  };

  return (
    <Box>
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
        <DynamicFilters
          activeFilters={activeFilters}
          setActiveFilters={setActiveFilters}
        />
      </Box>
      {showClearButton && (
        <Box display="flex" alignItems="center" gap="12px" mt="12px">
          <FilteredProjectCount />
          <ClearFiltersButton
            onClick={handleClearAll}
            dataCy="projects-overview-clear-filters"
          />
        </Box>
      )}
    </Box>
  );
};

const Filters = () => {
  const { data: user } = useAuthUser();
  if (!user) return null;

  return <FilterBar user={user} />;
};

export default Filters;
