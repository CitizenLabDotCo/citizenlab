import React, { useState } from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import sharedMessages from '../../_shared/messages';
import { useParam, setParam } from '../utils';

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

// Define specific prop types for each filter component
interface ManagerProps {
  managerIds: string[];
  onChange: (managers: string[]) => void;
}

interface StatusProps {
  values: string[];
  onChange: (values: string[]) => void;
}

interface FoldersProps {
  folderIds: string[];
  onChange: (folderIds: string[]) => void;
}

interface ParticipationStatesProps {
  participationStates: string[];
  onChange: (participationStates: string[]) => void;
}

interface ParticipationMethodsProps {
  participationMethods: string[];
  onChange: (participationMethods: string[]) => void;
}

interface VisibilityProps {
  visibility: string[];
  onChange: (visibility: string[]) => void;
}

interface DiscoverabilityProps {
  discoverability: string[];
  onChange: (discoverability: string[]) => void;
}

// Union type for all filter component props
type FilterComponentProps =
  | ManagerProps
  | StatusProps
  | FoldersProps
  | ParticipationStatesProps
  | ParticipationMethodsProps
  | VisibilityProps
  | DiscoverabilityProps;

interface FilterConfig {
  type: FilterType;
  label: string;
  paramKey: string;
  component: React.ComponentType<FilterComponentProps>;
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
              <ActiveFilterComponent
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

const ActiveFilterComponent = ({
  filterType,
  config,
  onRemove,
}: {
  filterType: FilterType;
  config: FilterConfig;
  onRemove: () => void;
}) => {
  const [FilterComponent, setFilterComponent] =
    useState<React.ComponentType<FilterComponentProps> | null>(null);

  // Get the current value for this filter
  const currentValue = useParam(config.paramKey as any) ?? [];

  // Dynamically load the filter component
  React.useEffect(() => {
    const loadComponent = async () => {
      try {
        let component;
        switch (filterType) {
          case 'manager':
            component = (await import('../../_shared/Manager')).default;
            break;
          case 'status':
            component = (await import('../../_shared/Status')).default;
            break;
          case 'folders':
            component = (await import('./Folders')).default;
            break;
          case 'participation_states':
            component = (await import('./ParticipationStates')).default;
            break;
          case 'participation_methods':
            component = (await import('./ParticipationMethods')).default;
            break;
          case 'visibility':
            component = (await import('./Visibility')).default;
            break;
          case 'discoverability':
            component = (await import('./Discoverability')).default;
            break;
          default:
            component = null;
        }
        setFilterComponent(() => component);
      } catch (error) {
        console.error('Failed to load filter component:', error);
      }
    };

    loadComponent();
  }, [filterType]);

  const handleChange = (value: string[]) => {
    setParam(config.paramKey as any, value);
  };

  const getFilterProps = (
    filterType: FilterType,
    currentValue: string[]
  ): FilterComponentProps => {
    switch (filterType) {
      case 'manager':
        return { managerIds: currentValue, onChange: handleChange };
      case 'status':
        return { values: currentValue, onChange: handleChange };
      case 'folders':
        return { folderIds: currentValue, onChange: handleChange };
      case 'participation_states':
        return { participationStates: currentValue, onChange: handleChange };
      case 'participation_methods':
        return { participationMethods: currentValue, onChange: handleChange };
      case 'visibility':
        return { visibility: currentValue, onChange: handleChange };
      case 'discoverability':
        return { discoverability: currentValue, onChange: handleChange };
      default:
        throw new Error(`Unknown filter type: ${filterType}`);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="row"
      alignItems="center"
      p="4px 12px"
      border="1px solid"
      borderColor="grey300"
      borderRadius="4px"
      background="white"
    >
      {FilterComponent && (
        <Box flex="1">
          <FilterComponent {...getFilterProps(filterType, currentValue)} />
        </Box>
      )}

      <Button
        buttonStyle="text"
        icon="close"
        onClick={onRemove}
        text=""
        iconSize="16px"
        px="0px"
      />
    </Box>
  );
};

export default DynamicFilters;
