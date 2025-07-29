import React, { useState } from 'react';

import { Box, Icon } from '@citizenlab/cl2-component-library';

import { useParam, setParam } from '../utils';

import { FilterType } from './DynamicFilters';

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

interface Props {
  filterType: FilterType;
  config: FilterConfig;
  onRemove: () => void;
  canRemove?: boolean;
}

const ActiveFilter = ({
  filterType,
  config,
  onRemove,
  canRemove = true,
}: Props) => {
  const [FilterComponent, setFilterComponent] =
    useState<React.ComponentType<FilterComponentProps> | null>(null);
  const [isHovered, setIsHovered] = useState(false);

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
      py="10px"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {FilterComponent && (
        <Box flex="1">
          <FilterComponent {...getFilterProps(filterType, currentValue)} />
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
          borderColor="grey300"
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
