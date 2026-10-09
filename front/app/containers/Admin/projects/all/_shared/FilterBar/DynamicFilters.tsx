import React, { useState } from 'react';

import { Button } from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { isAdmin } from 'utils/permissions/roles';

import { countActiveFilters } from '../activeFilters';
import { Parameter, useParams, setParam } from '../params';

import ActiveFilter from './ActiveFilter';
import AddFilterDropdown from './AddFilterDropdown';
import { FILTER_KEYS, FilterKey } from './constants';
import messages from './messages';
import tracks from './tracks';

// Filters that are always shown in the filter bar, rather than added through
// the "Add filter" dropdown.
const DEFAULT_FILTERS: Parameter[] = [
  'review_state',
  'min_start_date',
  'max_start_date',
];

const DynamicFilters = () => {
  const { data: authUser } = useAuthUser();
  const isUserAdmin = isAdmin(authUser);

  const params = useParams();
  const { formatMessage } = useIntl();
  const spacesEnabled = useFeatureFlag({ name: 'spaces' });

  const [activeFilters, setActiveFilters] = useState(() => {
    return FILTER_KEYS.filter((key) => {
      const paramValue = params[key];

      if (!isUserAdmin && key === 'managers') {
        return false; // Skip manager filter for non-admin users
      }

      return paramValue !== undefined && paramValue.length > 0;
    });
  });

  // Also show it for an added filter without a value yet, so it can be
  // removed again.
  const showClearButton =
    activeFilters.length > 0 || countActiveFilters(params, undefined) > 0;

  const handleAddFilter = (filterKey: FilterKey) => {
    if (!activeFilters.includes(filterKey)) {
      setActiveFilters([...activeFilters, filterKey]);

      trackEventByName(tracks.addFilter, {
        filter: filterKey,
      });
    }
  };

  const handleRemoveFilter = (filterKey: FilterKey) => {
    setActiveFilters(activeFilters.filter((f) => f !== filterKey));

    // Clear the parameter when removing the filter
    setParam(filterKey, undefined);

    trackEventByName(tracks.removeFilter, {
      filter: filterKey,
    });
  };

  const handleClearAll = () => {
    // Clear all parameters, including the default filters, the sort and the
    // search
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

  const getAvailableFilters = () => {
    const availableFilterKeys = FILTER_KEYS.filter(
      (key) => !activeFilters.includes(key)
    );

    if (!spacesEnabled) {
      return availableFilterKeys.filter((key) => key !== 'space_ids');
    }

    return availableFilterKeys;
  };

  const availableFilters = getAvailableFilters();

  return (
    <>
      {activeFilters.map((filterKey) => {
        return (
          <ActiveFilter
            key={filterKey}
            filterKey={filterKey}
            onRemove={() => handleRemoveFilter(filterKey)}
          />
        );
      })}

      <AddFilterDropdown
        availableFilters={availableFilters}
        onAddFilter={handleAddFilter}
      />
      {showClearButton && (
        <Button
          buttonStyle="text"
          onClick={handleClearAll}
          text={formatMessage(messages.clear)}
          m="0"
          ml="-16px"
        />
      )}
    </>
  );
};

export default DynamicFilters;
