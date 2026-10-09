import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { trackEventByName } from 'utils/analytics';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';

import {
  countActiveFilters,
  FOLDER_FILTERS,
} from '../../_shared/activeFilters';
import ClearFiltersButton from '../../_shared/FilterBar/ClearFiltersButton';
import Manager from '../../_shared/FilterBar/Filters/Manager';
import Spaces from '../../_shared/FilterBar/Filters/Spaces';
import Status from '../../_shared/FilterBar/Filters/Status';
import tracks from '../../_shared/FilterBar/tracks';
import { useParams } from '../../_shared/params';

const Filters = () => {
  const spacesEnabled = useFeatureFlag({ name: 'spaces' });
  const params = useParams();

  const showClearButton = countActiveFilters(params, 'folders') > 0;

  const handleClearAll = () => {
    removeSearchParams(FOLDER_FILTERS);
    trackEventByName(tracks.clearFilters, { tab: 'folders' });
  };

  return (
    <Box
      display="flex"
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
    >
      <Box display="flex" alignItems="center" w="100%">
        <Manager mr="8px" />
        <Status mr="8px" />
        {spacesEnabled && <Spaces mr="8px" />}
        {showClearButton && (
          <ClearFiltersButton
            onClick={handleClearAll}
            dataCy="projects-overview-folders-clear-filters"
          />
        )}
      </Box>
    </Box>
  );
};

export default Filters;
