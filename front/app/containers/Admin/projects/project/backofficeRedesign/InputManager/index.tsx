import React, { useState } from 'react';

import { Box, Spinner } from '@citizenlab/cl2-component-library';

import { IIdeaData } from 'api/ideas/types';
import useIdeas from 'api/ideas/useIdeas';
import useIdeasFilterCounts from 'api/ideas_filter_counts/useIdeasFilterCounts';
import { IPhaseData } from 'api/phases/types';
import usePhases from 'api/phases/usePhases';
import { IProjectData } from 'api/projects/types';

import useLocalize from 'hooks/useLocalize';

import AnalysisBanner from 'containers/Admin/projects/_shared/components/AnalysisBanner';

import { ManagerType, PreviewMode } from 'components/admin/PostManager';
import NoPost from 'components/admin/PostManager/components/PostTable/NoPost';

import { getPageNumberFromUrl } from 'utils/paginationUtils';

import { ColumnKey, getColumns } from './columns';
import EmptyState from './EmptyState';
import FilterChips from './FilterMenu/FilterChips';
import useFilterCategories from './FilterMenu/useFilterCategories';
import IdeaTable from './IdeaTable';
import ListToolbar from './ListToolbar';
import RightColumn from './RightColumn';
import SidePanel from './SidePanel';
import useManagerParams from './useManagerParams';
import usePanelNavigation from './usePanelNavigation';
import usePhaseCounts from './usePhaseCounts';
import usePickerOptions from './usePickerOptions';

const PAGE_SIZE = 20;

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

  // Proposals only ever belong to the phase they were posted in.
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

  // Kept as data, not ids, so the batch actions still know the tags and
  // phases of inputs selected on another page.
  const [selection, setSelection] = useState<Map<string, IIdeaData>>(new Map());
  const [editingIdeaId, setEditingIdeaId] = useState<string>();
  const panelMode: PreviewMode =
    selectedIdeaId && editingIdeaId === selectedIdeaId ? 'edit' : 'view';

  const pageIdeas = ideas?.data ?? [];
  const lastPage = (ideas && getPageNumberFromUrl(ideas.links.last)) || 1;
  const filteredTotal = filteredCounts?.data.attributes.total;

  const openPanel = (ideaId: string, mode: PreviewMode = 'view') => {
    // The panel acts on one input, so it replaces the selection.
    setSelection(new Map());
    setEditingIdeaId(mode === 'edit' ? ideaId : undefined);
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

  const toggleSelect = (idea: IIdeaData) => {
    const next = new Map(selection);
    if (next.has(idea.id)) {
      next.delete(idea.id);
    } else {
      next.set(idea.id, idea);
    }
    setSelection(next);
  };

  const toggleSelectPage = () => {
    const next = new Map(selection);
    const allSelected = pageIdeas.every((idea) => next.has(idea.id));
    pageIdeas.forEach((idea) =>
      allSelected ? next.delete(idea.id) : next.set(idea.id, idea)
    );
    setSelection(next);
  };

  const refreshSelected = (idea: IIdeaData) =>
    setSelection((current) =>
      current.has(idea.id) ? new Map(current).set(idea.id, idea) : current
    );

  // The page's copy of an input is the freshest one.
  const selectedIdeas = [...selection.values()].map(
    (idea) => pageIdeas.find((pageIdea) => pageIdea.id === idea.id) ?? idea
  );
  const hasFilters =
    categories.some((category) => category.isActive) || !!searchTerm;

  return (
    <Box display="flex" gap="24px" alignItems="flex-start">
      <Box flex="1 1 auto" minWidth="0">
        <AnalysisBanner projectId={project.id} phaseId={phase.id} />
        <ListToolbar
          type={type}
          projectId={project.id}
          count={filteredTotal}
          selectedIdeas={selectedIdeas}
          onUpdated={refreshSelected}
          onEdit={(ideaId) => openPanel(ideaId, 'edit')}
          onClearSelection={() => setSelection(new Map())}
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
              {counts?.total === 0 && !hasFilters ? (
                <EmptyState />
              ) : pageIdeas.length === 0 ? (
                <NoPost handleSeeAll={clearFilters} />
              ) : (
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
                  selectedIds={new Set(selection.keys())}
                  onToggleSelect={toggleSelect}
                  onToggleSelectPage={toggleSelectPage}
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
      </Box>
      <Box flex="0 0 340px" width="340px" position="sticky" top="0">
        <RightColumn
          type={type}
          project={project}
          phase={phase}
          counts={counts}
          statuses={statuses}
          selectedIds={[...selection.keys()]}
          onShowAwaitingReply={() => setFilters({ reply: 'awaiting' })}
        />
      </Box>
      <SidePanel
        ideaId={selectedIdeaId}
        mode={panelMode}
        type={type}
        context={localize(phase.attributes.title_multiloc)}
        listedPhase={listedPhase}
        navigation={navigation}
        onChangeMode={(mode) =>
          setEditingIdeaId(mode === 'edit' ? selectedIdeaId : undefined)
        }
        onClose={() => setSelectedIdeaId(undefined)}
      />
    </Box>
  );
};

export default InputManager;
