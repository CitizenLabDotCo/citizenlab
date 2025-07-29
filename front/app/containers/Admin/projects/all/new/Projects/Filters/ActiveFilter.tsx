import React, { ComponentType, useState, useEffect } from 'react';

import { Box, colors, Icon } from '@citizenlab/cl2-component-library';

import { Parameters } from 'api/projects_mini_admin/types';

import { useParam, setParam } from '../utils';

import { FilterType } from './DynamicFilters';

export interface FilterComponentProps {
  value: string[];
  onChange: (value: string[]) => void;
}

interface FilterConfig {
  type: FilterType;
  label: string;
  paramKey: keyof Parameters;
  component: ComponentType<FilterComponentProps>;
}

interface Props {
  config: FilterConfig;
  onRemove: () => void;
  canRemove?: boolean;
}

const ActiveFilter = ({ config, onRemove, canRemove = true }: Props) => {
  const [FilterComponent, setFilterComponent] =
    useState<ComponentType<FilterComponentProps> | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Get the current value for this filter
  const currentValue = (useParam(config.paramKey) ?? []) as string[];
  const filterType = config.type;

  // Dynamically load the filter component
  useEffect(() => {
    const componentLoaders: {
      [K in FilterType]?: () => Promise<{
        default: ComponentType<FilterComponentProps>;
      }>;
    } = {
      manager: () => import('../../_shared/Manager'),
      status: () => import('../../_shared/Status'),
      folders: () => import('./Folders'),
      participation_states: () => import('./ParticipationStates'),
      participation_methods: () => import('./ParticipationMethods'),
      visibility: () => import('./Visibility'),
      discoverability: () => import('./Discoverability'),
    };

    const loadComponent = async () => {
      const loader = componentLoaders[filterType];
      if (!loader) {
        console.error(
          `No component loader found for filter type: ${filterType}`
        );
        setFilterComponent(null);
        return;
      }

      try {
        const loadedComponent = (await loader()).default;
        setFilterComponent(() => loadedComponent);
      } catch (error) {
        console.error('Failed to load filter component:', error);
      }
    };

    loadComponent();
  }, [filterType]);

  const handleChange = (value: string[]) => {
    setParam(config.paramKey, value);
  };

  return (
    <Box
      display="flex"
      flexDirection="row"
      alignItems="center"
      p="4px 12px"
      border="1px solid"
      borderColor={colors.grey700}
      borderRadius="3px"
      background="white"
      py="10px"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {FilterComponent && (
        <Box flex="1">
          <FilterComponent value={currentValue} onChange={handleChange} />
        </Box>
      )}

      {canRemove && isHovered && (
        <Box
          as="button"
          type="button"
          borderRadius="50%"
          width="20px"
          height="20px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          background="grey100"
          border="1px solid"
          borderColor={colors.grey700}
          cursor="pointer"
          onClick={onRemove}
          aria-label="Remove filter"
          p="2px"
        >
          <Icon name="close" />
        </Box>
      )}
    </Box>
  );
};

export default ActiveFilter;
