import React, { useState } from 'react';

import { Button } from '@citizenlab/cl2-component-library';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';

import { useParams, setParam } from '../params';

import ActiveFilter from './ActiveFilter';
import AddFilterDropdown from './AddFilterDropdown';
import { FILTER_KEYS, FilterKey } from './constants';
import messages from './messages';
import tracks from './tracks';

const DynamicFilters = () => {
  const params = useParams();
  const { formatMessage } = useIntl();

  const [activeFilters, setActiveFilters] = useState(() => {
    return FILTER_KEYS.filter((key) => {
      const paramValue = params[key];
      return paramValue !== undefined && paramValue.length > 0;
    });
  });

  const showClearButton = activeFilters.length > 0;

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
    // Clear all parameters
    removeSearchParams(activeFilters);
    // Clear all active filters
    setActiveFilters([]);

    trackEventByName(tracks.clearFilters);
  };

  const availableFilters = FILTER_KEYS.filter(
    (key) => !activeFilters.includes(key)
  );

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
