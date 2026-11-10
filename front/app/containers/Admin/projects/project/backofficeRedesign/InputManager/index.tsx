import React, { useState } from 'react';

import { Box, Spinner } from '@citizenlab/cl2-component-library';

import useIdeas from 'api/ideas/useIdeas';
import useIdeasFilterCounts from 'api/ideas_filter_counts/useIdeasFilterCounts';
import { IPhaseData } from 'api/phases/types';
import usePhases from 'api/phases/usePhases';
import { IProjectData } from 'api/projects/types';

import useLocalize from 'hooks/useLocalize';

import AnalysisBanner from 'containers/Admin/projects/_shared/components/AnalysisBanner';

import { ManagerType } from 'components/admin/PostManager';
import NoPost from 'components/admin/PostManager/components/PostTable/NoPost';

import { getPageNumberFromUrl } from 'utils/paginationUtils';

import ManageLayout from '../Phase/ManageLayout';

import { ColumnKey, getColumns } from './columns';
import EditInputModal from './EditInputModal';
import EmptyState from './EmptyState';
import FilterChips from './FilterMenu/FilterChips';
import useFilterCategories from './FilterMenu/useFilterCategories';
import IdeaTable from './IdeaTable';
import ListToolbar from './ListToolbar';
import SideColumn from './SideColumn';
import SidePanel from './SidePanel';
import useManagerParams from './useManagerParams';
import usePanelNavigation from './usePanelNavigation';
import usePhaseCounts from './usePhaseCounts';
import usePickerOptions from './usePickerOptions';
import useSelection from './useSelection';

const PAGE_SIZE = 20;

const getListBody = (
  phaseTotal: number | undefined,
  hasFilters: boolean,
  listedCount: number
) => {
  if (phaseTotal === 0 && !hasFilters) return 'empty';
  if (listedCount === 0) return 'noMatches';
  return 'table';
};

interface Props {
  project: IProjectData;
  phase: IPhaseData;
}

const InputManager = ({ project, phase }: Props) => {
  const localize = useLocalize();
  const type: ManagerType =
    phase.attributes.participation_method === 'proposals'
      ? 'ProjectProposals'
      : 'ProjectIdeas';
  const isProposals = type === 'ProjectProposals';
  const {
    filters,
    queryParameters,
    page,
    sort,
    searchTerm,
    selectedIdeaId,
    setFilters,
    clearFilters,
    setSort,
    setPage,
    setSearchTerm,
    setSelectedIdeaId,
  } = useManagerParams(phase.id);

  const listedPhaseId = isProposals ? phase.id : filters.phase;
  const scope = isProposals
    ? { projects: [project.id], phase: phase.id }
    : { projects: [project.id], phase: listedPhaseId, transitive: true };
  const filterParameters = { ...queryParameters, ...scope };
  const listParameters = { ...filterParameters, 'page[size]': PAGE_SIZE };

  const { data: ideas, isPlaceholderData: isChangingList } = useIdeas({
    ...listParameters,
    'page[number]': page,
  });
  const { data: filteredCounts } = useIdeasFilterCounts(filterParameters);
  const { data: phases } = usePhases(project.id);
  const counts = usePhaseCounts(scope);
  const { statuses, tagOptions } = usePickerOptions(type, project.id);
  const categories = useFilterCategories({
    type,
    projectId: project.id,
    phase,
    filters,
    setFilters,
    counts,
  });

  const listedPhase = phases?.data.find((item) => item.id === listedPhaseId);
  const { available, initial } = getColumns(listedPhase, isProposals);
  const [chosenColumns, setChosenColumns] = useState<ColumnKey[] | null>(null);
  const columns = (chosenColumns ?? initial).filter((column) =>
    available.includes(column)
  );

  const [editingIdeaId, setEditingIdeaId] = useState<string>();

  const pageIdeas = ideas?.data ?? [];
  const lastPage = (ideas && getPageNumberFromUrl(ideas.links.last)) || 1;
  const filteredTotal = filteredCounts?.data.attributes.total;
  const selection = useSelection(pageIdeas, filterParameters);

  const openPanel = (ideaId: string) => {
    selection.clear();
    setSelectedIdeaId(ideaId);
  };

  const navigation = usePanelNavigation({
    openIdeaId: selectedIdeaId,
    pageIdeas,
    listParameters,
    page,
    pageSize: PAGE_SIZE,
    lastPage,
    total: filteredTotal,
    onOpen: openPanel,
    onChangePage: setPage,
  });

  const hasFilters =
    categories.some((category) => category.isActive) || !!searchTerm;
  const listBody = getListBody(counts?.total, hasFilters, pageIdeas.length);

  return (
    <ManageLayout
      side={
        <SideColumn
          type={type}
          project={project}
          phase={phase}
          counts={counts}
          statuses={statuses}
          selectedIds={selection.selectedIds}
          filters={filters}
          setFilters={setFilters}
        />
      }
    >
      <AnalysisBanner projectId={project.id} phaseId={phase.id} />
      <ListToolbar
        type={type}
        projectId={project.id}
        count={filteredTotal}
        selectedIdeas={selection.selectedIdeas}
        onUpdated={selection.refresh}
        onEdit={setEditingIdeaId}
        onClearSelection={selection.clear}
        onSelectAll={selection.selectAll}
        isSelectingAll={selection.isSelectingAll}
        selectAllFailed={selection.selectAllFailed}
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        categories={categories}
        onClearFilters={clearFilters}
      />
      <FilterChips categories={categories} onClearAll={clearFilters} />
      <Box position="relative">
        {!ideas ? (
          <Box display="flex" justifyContent="center" py="80px">
            <Spinner />
          </Box>
        ) : (
          <Box opacity={isChangingList ? 0.4 : 1}>
            {listBody === 'empty' && <EmptyState />}
            {listBody === 'noMatches' && <NoPost handleSeeAll={clearFilters} />}
            {listBody === 'table' && (
              <IdeaTable
                ideas={pageIdeas}
                columns={columns}
                availableColumns={available}
                onChangeColumns={setChosenColumns}
                sort={sort}
                onSort={setSort}
                statuses={statuses}
                tagLabels={
                  new Map(
                    tagOptions.map((option) => [option.value, option.label])
                  )
                }
                selectedIds={new Set(selection.selectedIds)}
                onToggleSelect={selection.toggle}
                onToggleSelectPage={selection.togglePage}
                openIdeaId={selectedIdeaId}
                onOpen={openPanel}
                currentPage={page}
                lastPage={lastPage}
                onChangePage={setPage}
              />
            )}
          </Box>
        )}
        {ideas && isChangingList && (
          <Box
            position="absolute"
            top="80px"
            left="0"
            right="0"
            display="flex"
            justifyContent="center"
          >
            <Spinner />
          </Box>
        )}
      </Box>
      <SidePanel
        ideaId={selectedIdeaId}
        type={type}
        context={localize(phase.attributes.title_multiloc)}
        listedPhase={listedPhase}
        navigation={navigation}
        onEdit={setEditingIdeaId}
        onClose={() => setSelectedIdeaId(undefined)}
        isEditing={!!editingIdeaId}
      />
      {editingIdeaId && (
        <EditInputModal
          key={editingIdeaId}
          ideaId={editingIdeaId}
          phaseId={phase.id}
          onClose={() => setEditingIdeaId(undefined)}
        />
      )}
    </ManageLayout>
  );
};

export default InputManager;
