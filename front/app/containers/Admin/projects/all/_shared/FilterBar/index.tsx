import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';
import { IUser } from 'api/users/types';

import { trackEventByName } from 'utils/analytics';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { isAdmin, isSpaceModerator } from 'utils/permissions/roles';
import { isProjectFolderModerator } from 'utils/permissions/rules/projectFolderPermissions';

import { countActiveFilters, hasValue } from '../activeFilters';
import FilteredProjectCount from '../FilteredProjectCount';
import { Parameter, useParams } from '../params';

import ClearFiltersButton from './ClearFiltersButton';
import { FILTER_KEYS, FilterKey } from './constants';
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

  // Filters the user added via the dropdown. Kept separately from the URL so
  // that a just-added filter stays visible before (and after) it has a value.
  const [addedFilters, setAddedFilters] = useState<FilterKey[]>([]);

  const activeFilters = [
    ...FILTER_KEYS.filter(
      (key) => hasValue(params[key]) && !addedFilters.includes(key)
    ),
    ...addedFilters,
  ];

  const showClearButton =
    addedFilters.length > 0 || countActiveFilters(params, undefined) > 0;

  const handleClearAll = () => {
    removeSearchParams([...FILTER_KEYS, ...DEFAULT_FILTERS, 'sort', 'search']);
    setAddedFilters([]);

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
          setAddedFilters={setAddedFilters}
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
