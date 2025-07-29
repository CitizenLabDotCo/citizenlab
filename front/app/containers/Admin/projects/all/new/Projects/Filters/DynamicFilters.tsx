import React, { useState } from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import sharedMessages from '../../_shared/messages';
import { setParam } from '../utils';

import ActiveFilter from './ActiveFilter';
import AddFilterDropdown from './AddFilterDropdown';
import messages from './messages';

export type FilterType =
  | 'manager'
  | 'status'
  | 'folders'
  | 'participation_states'
  | 'participation_methods'
  | 'visibility'
  | 'discoverability';

interface FilterConfig {
  type: FilterType;
  label: string;
  paramKey: string;
  component: React.ComponentType<any>;
}

const DynamicFilters = () => {
  const { formatMessage } = useIntl();
  const [activeFilters, setActiveFilters] = useState<FilterType[]>([]);

  const FILTER_CONFIGS: FilterConfig[] = [
    {
      type: 'manager',
      label: formatMessage(sharedMessages.manager),
      paramKey: 'managers',
      component: () => null,
    },
    {
      type: 'status',
      label: formatMessage(messages.status),
      paramKey: 'status',
      component: () => null,
    },
    {
      type: 'folders',
      label: formatMessage(messages.folders),
      paramKey: 'folder_ids',
      component: () => null,
    },
    {
      type: 'participation_states',
      label: formatMessage(messages.participationStates),
      paramKey: 'participation_states',
      component: () => null,
    },
    {
      type: 'participation_methods',
      label: formatMessage(messages.participationMethodLabel),
      paramKey: 'participation_methods',
      component: () => null,
    },
    {
      type: 'visibility',
      label: formatMessage(messages.visibilityLabel),
      paramKey: 'visibility',
      component: () => null,
    },
    {
      type: 'discoverability',
      label: formatMessage(messages.discoverabilityLabel),
      paramKey: 'discoverability',
      component: () => null,
    },
  ];

  const handleAddFilter = (filterType: FilterType) => {
    if (!activeFilters.includes(filterType)) {
      setActiveFilters([...activeFilters, filterType]);
    }
  };

  const handleRemoveFilter = (filterType: FilterType) => {
    setActiveFilters(activeFilters.filter((f) => f !== filterType));
    // Clear the parameter when removing the filter
    const config = FILTER_CONFIGS.find((c) => c.type === filterType);
    if (config) {
      setParam(config.paramKey as any, []);
    }
  };

  const handleClearAll = () => {
    setActiveFilters([]);
    // Clear all filter parameters
    FILTER_CONFIGS.forEach((config) => {
      setParam(config.paramKey as any, []);
    });
  };

  const availableFilters = FILTER_CONFIGS.filter(
    (config) => !activeFilters.includes(config.type)
  );

  return (
    <Box display="flex" flexDirection="column" gap="16px">
      {/* Active Filters Row */}
      {activeFilters.length > 0 && (
        <Box
          display="flex"
          flexDirection="row"
          alignItems="flex-start"
          flexWrap="wrap"
          gap="8px"
        >
          {activeFilters.map((filterType) => {
            const config = FILTER_CONFIGS.find((c) => c.type === filterType);
            if (!config) return null;

            return (
              <ActiveFilter
                key={filterType}
                filterType={filterType}
                config={config}
                onRemove={() => handleRemoveFilter(filterType)}
              />
            );
          })}
        </Box>
      )}

      {/* Add Filter and Clear Controls */}
      <Box display="flex" flexDirection="row" alignItems="center" gap="12px">
        <AddFilterDropdown
          availableFilters={availableFilters}
          onAddFilter={handleAddFilter}
        />
        {activeFilters.length > 0 && (
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
