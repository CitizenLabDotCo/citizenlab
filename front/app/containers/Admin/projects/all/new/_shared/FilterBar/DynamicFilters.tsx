import React, { useState } from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';

import { useParams, setParam } from '../params';

import AddFilterDropdown from './AddFilterDropdown';
import { FILTER_KEYS, FilterKey } from './constants';
import messages from './messages';

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
    }
  };

  const handleRemoveFilter = (filterKey: FilterKey) => {
    setActiveFilters(activeFilters.filter((f) => f !== filterKey));

    // Clear the parameter when removing the filter
    setParam(filterKey, undefined);
  };

  const handleClearAll = () => {
    // Clear all parameters
    removeSearchParams(activeFilters);
    // Clear all active filters
    setActiveFilters([]);
  };

  const availableFilters = FILTER_KEYS.filter(
    (key) => !activeFilters.includes(key)
  );

  return (
    <Box display="flex" flexDirection="column" gap="16px">
      <Box
        display="flex"
        flexDirection="row"
        flexWrap="wrap"
        gap="8px"
        alignItems="center"
      >
        {activeFilters.map((filterKey) => {
          return (
            <ActiveFilter
              key={filterType}
              config={config}
              onRemove={() => handleRemoveFilter(filterType)}
              canRemove={canRemove}
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
          />
        )}
      </Box>
    </Box>
  );
};

export default DynamicFilters;
