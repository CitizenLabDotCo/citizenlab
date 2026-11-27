import React, { useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import Banner from 'design-system/Banner';

import commonGroundResultsKeys from 'api/common_ground/keys/commonGroundResultsKeys';
import useCommonGroundResults from 'api/common_ground/useCommonGroundResults';
import useCopyInputs from 'api/copy_inputs/useCopyInputs';
import useJobInProgressByPhase from 'api/copy_inputs/useJobInProgressByPhase';
import useIdeas from 'api/ideas/useIdeas';
import useIdeasFilterCounts from 'api/ideas_filter_counts/useIdeasFilterCounts';
import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

import useLocalize from 'hooks/useLocalize';

import inputManagerMessages from 'components/admin/PostManager/CommonGroundInputManager/messages';
import { UNASSIGNED } from 'components/admin/PostManager/useAssigneeOptions';

import { FormattedMessage } from 'utils/cl-intl';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

import FilterChips from '../InputManager/FilterMenu/FilterChips';
import inputStatsMessages from '../InputManager/messages';
import NoMatches from '../InputManager/NoMatches';
import SidePanel from '../InputManager/SidePanel';
import usePanelNavigation from '../InputManager/usePanelNavigation';
import useSelection from '../InputManager/useSelection';
import ImportInputsModal from '../Phase/BuildPanel/BuildFields/MethodSection/CommonGroundSection/ImportInputsModal';
import EmptySideColumn from '../Phase/EmptySideColumn';
import ListLoadError from '../Phase/ListLoadError';
import ManageLayout from '../Phase/ManageLayout';
import ListRowsSkeleton from '../WorkspaceSkeleton/ListRowsSkeleton';

import AddStatementModal from './AddStatementModal';
import EditStatementModal from './EditStatementModal';
import EmptyList from './EmptyList';
import messages from './messages';
import StatementSideColumn from './StatementSideColumn';
import StatementTable from './StatementTable';
import StatementToolbar from './StatementToolbar';
import useAgreementFilter from './useAgreementFilter';
import 'design-system/tokens.css';

const PAGE_SIZE = 20;

interface Props {
  project: IProjectData;
  phase: IPhaseData;
}

const CommonGroundManager = ({ project, phase }: Props) => {
  const localize = useLocalize();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [agreeSort, setAgreeSort] = useState<
    'new' | 'agree_percent' | '-agree_percent'
  >('agree_percent');
  const [participantFilter, setParticipantFilter] = useState(false);
  const [warningFilter, setWarningFilter] = useState(false);
  const [unassignedFilter, setUnassignedFilter] = useState(false);
  const [search, setSearch] = useState<string>();
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [importOpened, setImportOpened] = useState(false);
  const [addOpened, setAddOpened] = useState(false);
  const { mutate: copyInputs } = useCopyInputs();

  const { data: results } = useCommonGroundResults(phase.id);
  const statements = results?.data.attributes.ideas_by_agreement ?? [];
  const scope = {
    projects: [project.id],
    phase: phase.id,
    transitive: false,
  };
  const filteredScope = {
    ...scope,
    search,
    added_by_participants: participantFilter || undefined,
    content_warnings: warningFilter || undefined,
    assignee: unassignedFilter ? [UNASSIGNED] : undefined,
  };
  const { category: agreementCategory, agreements } = useAgreementFilter({
    statements,
    filtered:
      search || participantFilter || warningFilter || unassignedFilter
        ? filteredScope
        : undefined,
    onChange: () => setPage(1),
  });

  const listed = { ...filteredScope, agreements };
  const agreeSortDirection = {
    new: undefined,
    agree_percent: 'descending',
    '-agree_percent': 'ascending',
  } as const;

  const listParameters = {
    ...listed,
    sort: agreeSort,
    'page[size]': PAGE_SIZE,
  };
  const {
    data: ideas,
    isPlaceholderData: isChangingList,
    isError,
    refetch,
  } = useIdeas({
    ...listParameters,
    'page[number]': page,
  });
  const { data: allCounts } = useIdeasFilterCounts(scope);
  const { data: participantCounts } = useIdeasFilterCounts({
    ...scope,
    added_by_participants: true,
  });
  const { data: warningCounts } = useIdeasFilterCounts({
    ...scope,
    content_warnings: true,
  });
  const { data: listedCounts } = useIdeasFilterCounts(listed);
  const totals = allCounts?.data.attributes;
  const unassigned =
    totals?.assignee_id &&
    totals.total - Object.values(totals.assignee_id).reduce((a, b) => a + b, 0);
  const { data: importJob } = useJobInProgressByPhase(phase.id);

  const { progress: importedCount, total: totalToImport } =
    importJob?.data[0]?.attributes ?? {};
  const isImporting = importedCount !== undefined;

  const stats = results?.data.attributes.stats;
  const resultsById = new Map(
    statements.map((statement) => [statement.id, statement])
  );
  const listedTotal = listedCounts?.data.attributes.total;
  const pageIdeas = ideas?.data ?? [];
  const phaseTotal = allCounts?.data.attributes.total;
  const lastPage = (ideas && getPageNumberFromUrl(ideas.links.last)) || 1;
  const selection = useSelection(pageIdeas, listed);
  const editingIdea = [...pageIdeas, ...selection.selectedIdeas].find(
    (idea) => idea.id === editingId
  );

  const navigation = usePanelNavigation({
    openIdeaId: previewId ?? undefined,
    pageIdeas,
    listParameters,
    page,
    pageSize: PAGE_SIZE,
    lastPage,
    total: listedTotal,
    onOpen: setPreviewId,
    onChangePage: setPage,
  });

  const changeSearch = (term: string | null) => {
    setSearch(term || undefined);
    setPage(1);
  };

  const clearFilters = () => {
    agreementCategory.clear();
    setParticipantFilter(false);
    setWarningFilter(false);
    setUnassignedFilter(false);
    changeSearch(null);
  };

  // The agreement filter and the stats come from the results.
  const refreshResults = () =>
    queryClient.invalidateQueries({
      queryKey: commonGroundResultsKeys.all(),
    });

  const refreshAfterDelete = () => {
    // The current page may be gone after the delete.
    setPage(1);
    refreshResults();
  };

  const importBanner = isImporting && (
    <Banner tone="info">
      <FormattedMessage
        {...inputManagerMessages.inputImportProgress}
        values={{ importedCount, totalCount: totalToImport }}
      />
    </Banner>
  );

  // Nothing in the phase yet: the library drops the stats and the actions.
  if (phaseTotal === 0) {
    return (
      <ManageLayout
        side={<EmptySideColumn />}
      >
        {importBanner}
        <EmptyList />
      </ManageLayout>
    );
  }

  return (
    <ManageLayout
      side={
        <StatementSideColumn
          projectId={project.id}
          stats={stats}
          filters={[
            {
              label: messages.addedByParticipants,
              value: participantCounts?.data.attributes.total,
              active: participantFilter,
              toggle: () => {
                setParticipantFilter(!participantFilter);
                setPage(1);
              },
            },
            {
              label: inputStatsMessages.unassigned,
              value: unassigned,
              active: unassignedFilter,
              toggle: () => {
                setUnassignedFilter(!unassignedFilter);
                setPage(1);
              },
            },
            {
              label: inputStatsMessages.contentWarnings,
              value: warningCounts?.data.attributes.total,
              active: warningFilter,
              toggle: () => {
                setWarningFilter(!warningFilter);
                setPage(1);
              },
            },
          ]}
          selectedIds={selection.selectedIds}
          onAdd={() => setAddOpened(true)}
          onImport={() => setImportOpened(true)}
        />
      }
    >
      {importBanner}
      <StatementToolbar
        selectedIdeas={selection.selectedIdeas}
        listedTotal={listedTotal}
        onClearSelection={selection.clear}
        onDeleted={(ideaIds) => {
          selection.deselect(ideaIds);
          refreshAfterDelete();
        }}
        selectAllFailed={selection.selectAllFailed}
        search={search}
        onSearch={changeSearch}
        agreementCategory={agreementCategory}
        onClearFilters={clearFilters}
      />
      <FilterChips categories={[agreementCategory]} onClearAll={clearFilters} />

      {isError && <ListLoadError onRetry={() => refetch()} />}
      {!ideas && !isError && <ListRowsSkeleton />}
      {ideas && pageIdeas.length === 0 && !!phaseTotal && (
        <NoMatches onClearFilters={clearFilters} />
      )}
      {pageIdeas.length > 0 && (
        <StatementTable
          ideas={pageIdeas}
          agreeSortDirection={agreeSortDirection[agreeSort]}
          onSortByAgree={() => {
            setAgreeSort(
              agreeSort === 'agree_percent' ? '-agree_percent' : 'agree_percent'
            );
            setPage(1);
          }}
          showModeration={phase.attributes.submission_enabled}
          resultsById={resultsById}
          selectedIds={new Set(selection.selectedIds)}
          openId={previewId}
          dimmed={isChangingList}
          currentPage={page}
          lastPage={lastPage}
          onSelectOnPage={selection.selectOnPage}
          total={listedTotal}
          onSelectAll={selection.selectAll}
          onClearSelection={selection.clear}
          onOpen={setPreviewId}
          onChangePage={setPage}
        />
      )}

      <SidePanel
        ideaId={previewId ?? undefined}
        type="ProjectIdeas"
        context={localize(phase.attributes.title_multiloc)}
        listedPhase={phase}
        navigation={navigation}
        onEdit={setEditingId}
        onDeleted={() => {
          setPreviewId(null);
          selection.clear();
          refreshAfterDelete();
        }}
        onClose={() => setPreviewId(null)}
        isEditing={!!editingIdea}
      />
      {editingIdea && (
        <EditStatementModal
          idea={editingIdea}
          phaseId={phase.id}
          onSaved={refreshResults}
          onClose={() => setEditingId(null)}
        />
      )}
      {addOpened && (
        <AddStatementModal
          phaseId={phase.id}
          onSaved={refreshResults}
          onClose={() => setAddOpened(false)}
        />
      )}
      {importOpened && (
        <ImportInputsModal
          projectId={project.id}
          phaseId={phase.id}
          onImport={(fromPhaseId) =>
            copyInputs({ toPhaseId: phase.id, fromPhaseId })
          }
          onClose={() => setImportOpened(false)}
        />
      )}
    </ManageLayout>
  );
};

export default CommonGroundManager;
