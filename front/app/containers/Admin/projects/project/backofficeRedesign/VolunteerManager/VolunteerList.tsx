import React from 'react';

import { IVolunteers, VolunteersSort } from 'api/volunteers/types';

import Spinner from 'design-system/Spinner';

import { useIntl } from 'utils/cl-intl';

import EmptyState from '../Phase/EmptyState';
import ListLoadError from '../Phase/ListLoadError';

import messages from './messages';
import styles from './VolunteerManager.module.css';
import VolunteerTable from './VolunteerTable';
import 'design-system/tokens.css';

interface Props {
  volunteers: IVolunteers | undefined;
  isError: boolean;
  onRetry: () => void;
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
  isError,
  onRetry,
  isChangingList,
  hasFilters,
  causeTitles,
  sort,
  onSort,
  currentPage,
  onChangePage,
}: Props) => {
  const { formatMessage } = useIntl();

  if (isError) return <ListLoadError onRetry={onRetry} />;

  if (!volunteers) {
    return (
      <div className={styles.loading}>
        <Spinner />
      </div>
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
    <div className={isChangingList ? styles.dimmed : undefined}>
      <VolunteerTable
        volunteers={volunteers}
        causeTitles={causeTitles}
        sort={sort}
        onSort={onSort}
        currentPage={currentPage}
        onChangePage={onChangePage}
      />
    </div>
  );
};

export default VolunteerList;
