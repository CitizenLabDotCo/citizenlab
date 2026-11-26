import React, { useState } from 'react';

import Text from 'design-system/Text';

import useCauses from 'api/causes/useCauses';
import { exportVolunteers } from 'api/causes/util';
import { IPhaseData } from 'api/phases/types';
import { VolunteersSort } from 'api/volunteers/types';
import useVolunteers from 'api/volunteers/useVolunteers';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import FilterMenu from '../InputManager/FilterMenu';
import FilterChips from '../InputManager/FilterMenu/FilterChips';
import { FilterCategory } from '../InputManager/FilterMenu/useFilterCategories';
import SearchToggle from '../InputManager/SearchToggle';
import Card from '../InputManager/SideColumn/Card';
import { toggled } from '../InputManager/utils';
import ManageLayout from '../Phase/ManageLayout';
import SetupCard from '../ProjectSetupPanel/SetupCard';

import CauseStats from './CauseStats';
import messages from './messages';
import VolunteerList from './VolunteerList';
import styles from './VolunteerManager.module.css';
import 'design-system/tokens.css';

const PAGE_SIZE = 20;

interface Props {
  phase: IPhaseData;
}

const VolunteerManager = ({ phase }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const [causeIds, setCauseIds] = useState<string[]>([]);
  const [search, setSearch] = useState<string>();
  const [sort, setSort] = useState<VolunteersSort>('-created_at');
  const [page, setPage] = useState(1);
  const [signedUp, setSignedUp] = useState<'this_week' | 'earlier'>();

  const { data: causes } = useCauses({ phaseId: phase.id });
  const {
    data: volunteers,
    isPlaceholderData: isChangingList,
    isError,
    refetch,
  } = useVolunteers({
    phaseId: phase.id,
    causes: causeIds,
    search,
    sort,
    signed_up: signedUp,
    'page[number]': page,
    'page[size]': PAGE_SIZE,
  });

  // Any change to what's listed starts again from the first page.
  const changeCauses = (next: string[]) => {
    setCauseIds(next);
    setPage(1);
  };
  const changeSearch = (term: string | null) => {
    setSearch(term || undefined);
    setPage(1);
  };
  const changeSort = (next: VolunteersSort) => {
    setSort(next);
    setPage(1);
  };
  const clearFilters = () => {
    changeCauses([]);
    changeSearch(null);
    setSignedUp(undefined);
  };

  const causeData = causes?.data ?? [];
  const causeTitles = new Map(
    causeData.map((cause) => [
      cause.id,
      localize(cause.attributes.title_multiloc),
    ])
  );
  const causeFilter: FilterCategory = {
    key: 'cause',
    label: formatMessage(messages.cause),
    icon: 'tag-16',
    options: causeData.map((cause) => ({
      value: cause.id,
      label: causeTitles.get(cause.id) ?? '',
      icon: 'tag-16',
      count: cause.attributes.volunteers_count,
    })),
    selected: causeIds,
    multiple: true,
    isActive: causeIds.length > 0,
    toggle: (causeId) => changeCauses(toggled(causeIds, causeId)),
    clear: () => changeCauses([]),
  };
  const toggleOnlyCause = (causeId: string) =>
    changeCauses(
      causeIds.length === 1 && causeIds[0] === causeId ? [] : [causeId]
    );

  const dateFilter: FilterCategory = {
    key: 'signedUp',
    label: formatMessage(messages.signedUpColumn),
    icon: 'calendar-16',
    options: [
      { value: 'this_week', label: formatMessage(messages.thisWeek) },
      { value: 'earlier', label: formatMessage(messages.earlier) },
    ],
    selected: signedUp ? [signedUp] : [],
    multiple: false,
    isActive: !!signedUp,
    toggle: (value) => {
      if (value !== 'this_week' && value !== 'earlier') return;
      setSignedUp(signedUp === value ? undefined : value);
      setPage(1);
    },
    clear: () => {
      setSignedUp(undefined);
      setPage(1);
    },
  };
  const categories = [causeFilter, dateFilter];
  const total = volunteers?.meta.total;

  return (
    <ManageLayout
      side={
        <>
          <CauseStats
            causes={causeData}
            selectedCauseIds={causeIds}
            onToggleCause={toggleOnlyCause}
          />
          <Card fillHeight>
            <SetupCard
              id="export-volunteers"
              title={formatMessage(messages.exportVolunteers)}
              behaviour={{
                kind: 'action',
                icon: 'download-16',
                onClick: () => exportVolunteers(phase.id),
              }}
            />
          </Card>
        </>
      }
    >
      <div className={styles.toolbar}>
        <Text variant="title" tone="primary">
          {total !== undefined &&
            formatMessage(messages.volunteerCount, { count: total })}
        </Text>
        <div className={styles.display}>
          <SearchToggle
            label={formatMessage(messages.searchVolunteers)}
            searchTerm={search}
            onChange={changeSearch}
            resultCount={total ?? 0}
          />
          <FilterMenu categories={categories} onClearAll={clearFilters} />
        </div>
      </div>
      <FilterChips categories={categories} onClearAll={clearFilters} />
      <VolunteerList
        volunteers={volunteers}
        isError={isError}
        onRetry={() => refetch()}
        isChangingList={isChangingList}
        hasFilters={causeIds.length > 0 || !!search || !!signedUp}
        causeTitles={causeTitles}
        sort={sort}
        onSort={changeSort}
        currentPage={page}
        onChangePage={setPage}
      />
    </ManageLayout>
  );
};

export default VolunteerManager;
