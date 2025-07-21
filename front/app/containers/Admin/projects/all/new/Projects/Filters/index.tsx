import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import Manager from '../../_shared/Manager';
import Search from '../../_shared/Search';
import Status from '../../_shared/Status';
import { useParam, setParam } from '../utils';

import Dates from './Dates';
import Folders from './Folders';
import messages from './messages';
import ParticipationMethods from './ParticipationMethods';
import ParticipationStates from './ParticipationStates';
import Sort from './Sort';

const Filters = () => {
  const { formatMessage } = useIntl();
  const managerIds = useParam('managers') ?? [];
  const statuses = useParam('status') ?? [];
  const participationStates = useParam('participation_states') ?? [];
  const searchValue = useParam('search');
  const folderIdsParam = useParam('folder_ids');
  const folderIds = Array.isArray(folderIdsParam) ? folderIdsParam : [];
  const participationMethods = useParam('participation_methods') ?? [];

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="flex-end"
      gap="16px"
    >
      <Box minWidth="300px" display="flex" justifyContent="flex-end">
        <Search
          value={searchValue}
          placeholder={formatMessage(messages.search)}
          onChange={(search) => {
            setParam('search', search);
          }}
        />
      </Box>
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        w="100%"
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          w="100%"
        >
          <Box mr="12px" minWidth="300px">
            <Sort />
          </Box>
          <Manager
            managerIds={managerIds}
            onChange={(value) => {
              setParam('managers', value);
            }}
          />
          <Status
            mr="0px"
            values={statuses}
            onChange={(publicationStatuses) => {
              setParam('status', publicationStatuses);
            }}
          />
          <Folders
            folderIds={folderIds}
            onChange={(value) => setParam('folder_ids', value)}
          />
          <Box>
            <ParticipationStates
              participationStates={participationStates}
              onChange={(value) => {
                setParam('participation_states', value);
              }}
            />
          </Box>
          <Box mr="8px">
            <ParticipationMethods
              participationMethods={participationMethods}
              onChange={(value) => {
                setParam('participation_methods', value);
              }}
            />
          </Box>
          <Dates />
        </Box>
      </Box>
    </Box>
  );
};

export default Filters;
