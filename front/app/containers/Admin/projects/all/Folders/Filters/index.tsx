import React from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';

import Manager from '../../_shared/FilterBar/Filters/Manager';
import Spaces from '../../_shared/FilterBar/Filters/Spaces';
import Status from '../../_shared/FilterBar/Filters/Status';
import messages from '../../_shared/FilterBar/messages';
import tracks from '../../_shared/FilterBar/tracks';
import { Parameter, useParams } from '../../_shared/params';

// The search box in the header is not one of the filters, so "Clear" leaves
// it alone (like on the projects tab).
const FOLDER_FILTERS: Parameter[] = ['managers', 'status', 'space_ids'];

const Filters = () => {
  const spacesEnabled = useFeatureFlag({ name: 'spaces' });
  const { formatMessage } = useIntl();
  const params = useParams();

  const showClearButton = FOLDER_FILTERS.some(
    (paramName) => (params[paramName]?.length ?? 0) > 0
  );

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
          <Button
            buttonStyle="text"
            onClick={handleClearAll}
            text={formatMessage(messages.clear)}
            m="0"
            dataCy="projects-overview-folders-clear-filters"
          />
        )}
      </Box>
    </Box>
  );
};

export default Filters;
