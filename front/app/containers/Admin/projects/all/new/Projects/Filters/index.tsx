import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import Manager from '../../_shared/Manager';
import Search from '../../_shared/Search';
import Status from '../../_shared/Status';
import { useParam, setParam } from '../utils';

import Dates from './Dates';
import messages from './messages';
import ParticipationStates from './ParticipationStates';
import Sort from './Sort';

const Filters = () => {
  const { formatMessage } = useIntl();
  const managerIds = useParam('managers') ?? [];
  const statuses = useParam('status') ?? [];
  const participationStates = useParam('participation_states') ?? [];
  const searchValue = useParam('search');

  return (
    <Box
      display="flex"
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
    >
      <Box display="flex" alignItems="center" w="100%">
        <Sort mr="12px" />
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
        <ParticipationStates
          mr="8px"
          participationStates={participationStates}
          onChange={(value) => {
            setParam('participation_states', value);
          }}
        />
        <Dates />
      </Box>
      <Search
        value={searchValue}
        placeholder={formatMessage(messages.search)}
        onChange={(search) => {
          setParam('search', search);
        }}
      />
    </Box>
  );
};

export default Filters;
