import React from 'react';

import { Box, Spinner } from '@citizenlab/cl2-component-library';

import { IVolunteers, VolunteersSort } from 'api/volunteers/types';

import { useIntl } from 'utils/cl-intl';

import EmptyState from '../Phase/EmptyState';

import messages from './messages';
import VolunteerTable from './VolunteerTable';

interface Props {
  volunteers: IVolunteers | undefined;
  isChangingList: boolean;
  hasFilters: boolean;
  causeTitles: Map<string, string>;
  sort: VolunteersSort;
  onSort: (sort: VolunteersSort) => void;
  currentPage: number;
  onChangePage: (page: number) => void;
}

const VolunteerList = ({
  volunteers,
  isChangingList,
  hasFilters,
  causeTitles,
  sort,
  onSort,
  currentPage,
  onChangePage,
}: Props) => {
  const { formatMessage } = useIntl();

  if (!volunteers) {
    return (
      <Box display="flex" justifyContent="center" py="80px">
        <Spinner />
      </Box>
    );
  }

  if (volunteers.data.length === 0 && hasFilters) {
    return (
      <EmptyState
        size="small"
        description={formatMessage(messages.noMatchingVolunteers)}
      />
    );
  }

  if (volunteers.data.length === 0) {
    return (
      <EmptyState
        size="large"
        title={formatMessage(messages.noVolunteersYet)}
        description={formatMessage(messages.noVolunteersYetDescription)}
      />
    );
  }

  return (
    <Box opacity={isChangingList ? 0.4 : 1}>
      <VolunteerTable
        volunteers={volunteers}
        causeTitles={causeTitles}
        sort={sort}
        onSort={onSort}
        currentPage={currentPage}
        onChangePage={onChangePage}
      />
    </Box>
  );
};

export default VolunteerList;
