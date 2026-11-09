import React, { useState } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import useCauses from 'api/causes/useCauses';
import { exportVolunteers } from 'api/causes/util';
import { IPhaseData } from 'api/phases/types';
import { VolunteersSort } from 'api/volunteers/types';
import useVolunteers from 'api/volunteers/useVolunteers';

import useLocalize from 'hooks/useLocalize';

import volunteeringMessages from 'containers/Admin/projects/project/volunteering/messages';

import { useIntl } from 'utils/cl-intl';

import FilterMenu from '../InputManager/FilterMenu';
import FilterChips from '../InputManager/FilterMenu/FilterChips';
import { FilterCategory } from '../InputManager/FilterMenu/useFilterCategories';
import SearchToggle from '../InputManager/SearchToggle';
import Card from '../InputManager/SideColumn/Card';
import ManageLayout from '../Phase/ManageLayout';
import SetupCard from '../ProjectSetupPanel/SetupCard';

import CauseStats from './CauseStats';
import messages from './messages';
import VolunteerList from './VolunteerList';

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

  const { data: causes } = useCauses({ phaseId: phase.id });
  const { data: volunteers, isPlaceholderData: isChangingList } = useVolunteers(
    {
      phaseId: phase.id,
      causes: causeIds,
      search,
      sort,
      'page[number]': page,
      'page[size]': PAGE_SIZE,
    }
  );

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
    icon: 'label',
    options: causeData.map((cause) => ({
      value: cause.id,
      label: localize(cause.attributes.title_multiloc),
      icon: 'label',
      count: cause.attributes.volunteers_count,
    })),
    selected: causeIds,
    multiple: true,
    isActive: causeIds.length > 0,
    toggle: (causeId) =>
      changeCauses(
        causeIds.includes(causeId)
          ? causeIds.filter((id) => id !== causeId)
          : [...causeIds, causeId]
      ),
    clear: () => changeCauses([]),
  };
  const toggleOnlyCause = (causeId: string) =>
    changeCauses(
      causeIds.length === 1 && causeIds[0] === causeId ? [] : [causeId]
    );

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
              title={formatMessage(volunteeringMessages.exportVolunteers)}
              behaviour={{
                kind: 'action',
                icon: 'download',
                onClick: () => exportVolunteers(phase.id),
              }}
            />
          </Card>
        </>
      }
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        gap="12px"
        minHeight="40px"
        mb="12px"
      >
        <Text variant="boSection" fontSize="l" m="0">
          {total !== undefined &&
            formatMessage(messages.volunteerCount, { count: total })}
        </Text>
        <Box display="flex" alignItems="center" gap="8px">
          <SearchToggle
            label={formatMessage(messages.searchVolunteers)}
            searchTerm={search}
            onChange={changeSearch}
            resultCount={total ?? 0}
          />
          <FilterMenu categories={[causeFilter]} onClearAll={clearFilters} />
        </Box>
      </Box>
      <FilterChips categories={[causeFilter]} onClearAll={clearFilters} />
      <VolunteerList
        volunteers={volunteers}
        isChangingList={isChangingList}
        hasFilters={causeIds.length > 0 || !!search}
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
