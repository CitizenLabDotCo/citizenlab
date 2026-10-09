import React from 'react';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { trackEventByName } from 'utils/analytics';

import { setParam } from '../params';

import ActiveFilter from './ActiveFilter';
import AddFilterDropdown from './AddFilterDropdown';
import { FILTER_KEYS, FilterKey } from './constants';
import tracks from './tracks';

interface Props {
  // The filters added through the "Add filter" dropdown. Kept by the filter
  // bar, as its "Clear filters" button removes them too.
  activeFilters: FilterKey[];
  setActiveFilters: (activeFilters: FilterKey[]) => void;
}

const DynamicFilters = ({ activeFilters, setActiveFilters }: Props) => {
  const spacesEnabled = useFeatureFlag({ name: 'spaces' });

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
    </>
  );
};

export default DynamicFilters;
