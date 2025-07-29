import React, { useState, useEffect } from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';

import { useIntl } from 'utils/cl-intl';
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

interface FilterConfig {
  type: FilterType;
  label: string;
  paramKey: string;
  component: React.ComponentType<any>;
  removable?: boolean;
  roleRestrictions?: {
    admin?: boolean;
    projectManager?: boolean;
  };
}

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

  const FILTER_CONFIGS: FilterConfig[] = [
    {
      type: 'manager',
      label: formatMessage(sharedMessages.manager),
      paramKey: 'managers',
      component: () => null,
      removable: true,
      roleRestrictions: {
        projectManager: false, // Project managers can't remove manager filter
      },
    },
    {
      type: 'status',
      label: formatMessage(messages.status),
      paramKey: 'status',
      component: () => null,
      removable: true,
    },
    {
      type: 'folders',
      label: formatMessage(messages.folders),
      paramKey: 'folder_ids',
      component: () => null,
      removable: true,
    },
    {
      type: 'participation_states',
      label: formatMessage(messages.participationStates),
      paramKey: 'participation_states',
      component: () => null,
      removable: true,
    },
    {
      type: 'participation_methods',
      label: formatMessage(messages.participationMethodLabel),
      paramKey: 'participation_methods',
      component: () => null,
      removable: true,
    },
    {
      type: 'visibility',
      label: formatMessage(messages.visibilityLabel),
      paramKey: 'visibility',
      component: () => null,
      removable: true,
    },
    {
      type: 'discoverability',
      label: formatMessage(messages.discoverabilityLabel),
      paramKey: 'discoverability',
      component: () => null,
      removable: true,
    },
  ];

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
    const config = FILTER_CONFIGS.find((c) => c.type === filterType);

    // Check role-based restrictions
    if (config?.roleRestrictions) {
      const isUserAdmin = isAdmin(authUser);
      const isUserProjectManager = isModerator(authUser) && !isUserAdmin;

      if (
        isUserProjectManager &&
        config.roleRestrictions.projectManager === false
      ) {
        return; // Project managers can't remove this filter
      }
    }

    setActiveFilters(activeFilters.filter((f) => f !== filterType));
    // Clear the parameter when removing the filter
    if (config) {
      setParam(config.paramKey as any, []);
    }
  };

  const handleClearAll = () => {
    // Clear all active filters
    setActiveFilters([]);

    // Clear all parameters
    activeFilters.forEach((filterType) => {
      const config = FILTER_CONFIGS.find((c) => c.type === filterType);
      if (config) {
        setParam(config.paramKey as any, []);
      }
    });
  };

  const availableFilters = FILTER_CONFIGS.filter(
    (config) => !activeFilters.includes(config.type)
  );

  // Determine which default filters to show based on user role
  const isUserAdmin = isAdmin(authUser);
  const isUserProjectManager = isModerator(authUser) && !isUserAdmin;

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
      {/* Active Filters Row */}
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
          const config = FILTER_CONFIGS.find((c) => c.type === filterType);
          if (!config) return null;

          // Determine if this filter can be removed based on role restrictions
          let canRemove = true;
          if (config.roleRestrictions) {
            const isUserAdmin = isAdmin(authUser);
            const isUserProjectManager = isModerator(authUser) && !isUserAdmin;

            if (
              isUserProjectManager &&
              config.roleRestrictions.projectManager === false
            ) {
              canRemove = false; // Project managers can't remove this filter
            }
          }

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
    </Box>
  );
};

export default DynamicFilters;
