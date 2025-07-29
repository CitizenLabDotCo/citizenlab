import React, { useState, useEffect, useMemo } from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';
import { Parameters } from 'api/projects_mini_admin/types';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';
import { isAdmin, isModerator } from 'utils/permissions/roles';

import sharedMessages from '../../_shared/messages';
import { useParam, setParam } from '../utils';

import ActiveFilter from './ActiveFilter';
import AddFilterDropdown from './AddFilterDropdown';
import Dates from './Dates';
import messages from './messages';
import Sort from './Sort';

export type FilterType =
  | 'manager'
  | 'status'
  | 'folders'
  | 'participation_states'
  | 'participation_methods'
  | 'visibility'
  | 'discoverability';

type FilterComponentProps =
  | { managerIds: string[]; onChange: (managers: string[]) => void }
  | { values: string[]; onChange: (values: string[]) => void }
  | { folderIds: string[]; onChange: (folderIds: string[]) => void }
  | {
      participationStates: string[];
      onChange: (participationStates: string[]) => void;
    }
  | {
      participationMethods: string[];
      onChange: (participationMethods: string[]) => void;
    }
  | { visibility: string[]; onChange: (visibility: string[]) => void }
  | {
      discoverability: string[];
      onChange: (discoverability: string[]) => void;
    };

export interface FilterConfig {
  type: FilterType;
  label: string;
  paramKey: keyof Parameters;
  component: React.ComponentType<FilterComponentProps>;
}

const getFilterConfigs = (
  formatMessage: (message: MessageDescriptor) => string
): FilterConfig[] => [
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

const DynamicFilters = () => {
  const { formatMessage } = useIntl();
  const { data: authUser } = useAuthUser();
  const [activeFilters, setActiveFilters] = useState<FilterType[]>([]);
  const [hasInitializedFromUrl, setHasInitializedFromUrl] = useState(false);

  // Get all URL parameters at the component level
  const managersParam = useParam('managers');
  const statusParam = useParam('status');
  const folderIdsParam = useParam('folder_ids');
  const participationStatesParam = useParam('participation_states');
  const participationMethodsParam = useParam('participation_methods');
  const visibilityParam = useParam('visibility');
  const discoverabilityParam = useParam('discoverability');

  const isUserAdmin = isAdmin(authUser);
  const isUserModerator = isModerator(authUser);
  const isUserProjectManager = isUserModerator && !isUserAdmin;
  const showClearButton = !(
    (isUserProjectManager &&
      activeFilters.length === 1 &&
      activeFilters[0] === 'manager') ||
    (isUserAdmin && activeFilters.length === 0)
  );
  const filterConfigs = useMemo(
    () => getFilterConfigs(formatMessage),
    [formatMessage]
  );

  // Initialize filters from URL only once on mount
  useEffect(() => {
    if (!hasInitializedFromUrl) {
      const filtersFromUrl: FilterType[] = [];

      // Check each parameter and add corresponding filter if it has values
      if (
        managersParam &&
        Array.isArray(managersParam) &&
        managersParam.length > 0
      ) {
        filtersFromUrl.push('manager');
      }
      if (statusParam && Array.isArray(statusParam) && statusParam.length > 0) {
        filtersFromUrl.push('status');
      }
      if (
        folderIdsParam &&
        Array.isArray(folderIdsParam) &&
        folderIdsParam.length > 0
      ) {
        filtersFromUrl.push('folders');
      }
      if (
        participationStatesParam &&
        Array.isArray(participationStatesParam) &&
        participationStatesParam.length > 0
      ) {
        filtersFromUrl.push('participation_states');
      }
      if (
        participationMethodsParam &&
        Array.isArray(participationMethodsParam) &&
        participationMethodsParam.length > 0
      ) {
        filtersFromUrl.push('participation_methods');
      }
      if (
        visibilityParam &&
        Array.isArray(visibilityParam) &&
        visibilityParam.length > 0
      ) {
        filtersFromUrl.push('visibility');
      }
      if (
        discoverabilityParam &&
        Array.isArray(discoverabilityParam) &&
        discoverabilityParam.length > 0
      ) {
        filtersFromUrl.push('discoverability');
      }

      setActiveFilters(filtersFromUrl);
      setHasInitializedFromUrl(true);
    }
  }, [
    hasInitializedFromUrl,
    managersParam,
    statusParam,
    folderIdsParam,
    participationStatesParam,
    participationMethodsParam,
    visibilityParam,
    discoverabilityParam,
  ]);

  // Sync active filters with URL parameters (but don't override manual additions)
  useEffect(() => {
    if (hasInitializedFromUrl) {
      const currentFiltersFromUrl: FilterType[] = [];

      // Check each parameter and add corresponding filter if it has values
      if (
        managersParam &&
        Array.isArray(managersParam) &&
        managersParam.length > 0
      ) {
        currentFiltersFromUrl.push('manager');
      }
      if (statusParam && Array.isArray(statusParam) && statusParam.length > 0) {
        currentFiltersFromUrl.push('status');
      }
      if (
        folderIdsParam &&
        Array.isArray(folderIdsParam) &&
        folderIdsParam.length > 0
      ) {
        currentFiltersFromUrl.push('folders');
      }
      if (
        participationStatesParam &&
        Array.isArray(participationStatesParam) &&
        participationStatesParam.length > 0
      ) {
        currentFiltersFromUrl.push('participation_states');
      }
      if (
        participationMethodsParam &&
        Array.isArray(participationMethodsParam) &&
        participationMethodsParam.length > 0
      ) {
        currentFiltersFromUrl.push('participation_methods');
      }
      if (
        visibilityParam &&
        Array.isArray(visibilityParam) &&
        visibilityParam.length > 0
      ) {
        currentFiltersFromUrl.push('visibility');
      }
      if (
        discoverabilityParam &&
        Array.isArray(discoverabilityParam) &&
        discoverabilityParam.length > 0
      ) {
        currentFiltersFromUrl.push('discoverability');
      }

      // Merge current active filters with URL-based filters
      const mergedFilters = [
        ...new Set([...activeFilters, ...currentFiltersFromUrl]),
      ];

      // Only update if there's a difference to avoid unnecessary re-renders
      if (
        JSON.stringify(mergedFilters.sort()) !==
        JSON.stringify(activeFilters.sort())
      ) {
        setActiveFilters(mergedFilters);
      }
    }
  }, [
    hasInitializedFromUrl,
    activeFilters,
    managersParam,
    statusParam,
    folderIdsParam,
    participationStatesParam,
    participationMethodsParam,
    visibilityParam,
    discoverabilityParam,
  ]);

  const handleAddFilter = (filterType: FilterType) => {
    if (!activeFilters.includes(filterType)) {
      setActiveFilters([...activeFilters, filterType]);
    }
  };

  const handleRemoveFilter = (filterType: FilterType) => {
    const config = filterConfigs.find((c) => c.type === filterType);

    // Simple role-based check: project managers can't remove manager filter
    const isUserProjectManager = isModerator(authUser) && !isAdmin(authUser);
    if (filterType === 'manager' && isUserProjectManager) {
      return; // Project managers can't remove manager filter
    }

    setActiveFilters(activeFilters.filter((f) => f !== filterType));
    // Clear the parameter when removing the filter
    if (config) {
      setParam(config.paramKey as keyof Parameters, []);
    }
  };

  const handleClearAll = () => {
    // Clear all active filters
    setActiveFilters([]);

    // Clear all parameters
    activeFilters.forEach((filterType) => {
      const config = filterConfigs.find((c) => c.type === filterType);
      if (config) {
        setParam(config.paramKey as keyof Parameters, []);
      }
    });
  };

  const availableFilters = filterConfigs.filter(
    (config) => !activeFilters.includes(config.type)
  );

  // For project managers, always include the manager filter if not already present
  useEffect(() => {
    if (isUserProjectManager && !activeFilters.includes('manager')) {
      setActiveFilters([...activeFilters, 'manager']);
      // Pre-populate with current user's ID
      if (authUser && authUser.data.id) {
        setParam('managers', [authUser.data.id]);
      }
    }
  }, [isUserProjectManager, authUser, activeFilters]);

  return (
    <Box display="flex" flexDirection="column" gap="16px">
      <Box
        display="flex"
        flexDirection="row"
        flexWrap="wrap"
        gap="8px"
        alignItems="center"
      >
        <Box display="flex" flexDirection="row" alignItems="center" gap="8px">
          <Dates />
          <Sort />
        </Box>

        {/* Dynamic Filters */}
        {activeFilters.map((filterType) => {
          const config = filterConfigs.find((c) => c.type === filterType);
          if (!config) return null;

          // Simple role-based check for remove button visibility
          const canRemove = !(filterType === 'manager' && isUserProjectManager);

          return (
            <ActiveFilter
              key={filterType}
              filterType={filterType}
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
