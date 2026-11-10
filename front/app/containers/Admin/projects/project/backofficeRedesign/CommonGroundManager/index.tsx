import React, { useState } from 'react';

import { Box, Spinner } from '@citizenlab/cl2-component-library';
import { useQueryClient } from '@tanstack/react-query';

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
import NoInputsDisplay from 'components/admin/PostManager/CommonGroundInputManager/NoInputsDisplay';
import NoPost from 'components/admin/PostManager/components/PostTable/NoPost';
import Warning from 'components/UI/Warning';

import { FormattedMessage } from 'utils/cl-intl';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

import FilterChips from '../InputManager/FilterMenu/FilterChips';
import SidePanel from '../InputManager/SidePanel';
import usePanelNavigation from '../InputManager/usePanelNavigation';
import useSelection from '../InputManager/useSelection';
import ImportInputsModal from '../Phase/BuildPanel/BuildFields/MethodSection/CommonGroundSection/ImportInputsModal';
import ManageLayout from '../Phase/ManageLayout';

import AddStatementModal from './AddStatementModal';
import EditStatementModal from './EditStatementModal';
import StatementSideColumn from './StatementSideColumn';
import StatementTable from './StatementTable';
import StatementToolbar from './StatementToolbar';
import useAgreementFilter from './useAgreementFilter';

const PAGE_SIZE = 20;

interface Props {
  project: IProjectData;
  phase: IPhaseData;
}

const CommonGroundManager = ({ project, phase }: Props) => {
  const localize = useLocalize();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
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
  const { category: agreementCategory, agreements } = useAgreementFilter({
    statements,
    searched: search ? { ...scope, search } : undefined,
    onChange: () => setPage(1),
  });

  const listed = { ...scope, search, agreements };
  const listParameters = {
    ...listed,
    sort: 'new' as const,
    'page[size]': PAGE_SIZE,
  };
  const { data: ideas, isPlaceholderData: isChangingList } = useIdeas({
    ...listParameters,
    'page[number]': page,
  });
  const { data: allCounts } = useIdeasFilterCounts(scope);
  const { data: listedCounts } = useIdeasFilterCounts(listed);
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
    changeSearch(null);
  };

  // The agreement filter and the stats come from the results.
  const refreshResults = () =>
    queryClient.invalidateQueries({
      queryKey: commonGroundResultsKeys.all(),
    });

  const handleDeleted = () => {
    selection.clear();
    // The current page may be gone after the delete.
    setPage(1);
    refreshResults();
  };

  return (
    <ManageLayout
      side={
        <StatementSideColumn
          projectId={project.id}
          stats={stats}
          phaseTotal={phaseTotal}
          selectedIds={selection.selectedIds}
          onAdd={() => setAddOpened(true)}
          onImport={() => setImportOpened(true)}
        />
      }
    >
      {isImporting && (
        <Warning>
          <FormattedMessage
            {...inputManagerMessages.inputImportProgress}
            values={{ importedCount, totalCount: totalToImport }}
          />
        </Warning>
      )}
      <StatementToolbar
        selectedIdeas={selection.selectedIdeas}
        listedTotal={listedTotal}
        onEdit={setEditingId}
        onClearSelection={selection.clear}
        onDeleted={handleDeleted}
        onSelectAll={selection.selectAll}
        isSelectingAll={selection.isSelectingAll}
        selectAllFailed={selection.selectAllFailed}
        search={search}
        onSearch={changeSearch}
        agreementCategory={agreementCategory}
        onClearFilters={clearFilters}
      />
      <FilterChips categories={[agreementCategory]} onClearAll={clearFilters} />

      {!ideas && (
        <Box display="flex" justifyContent="center" py="80px">
          <Spinner />
        </Box>
      )}
      {ideas && phaseTotal === 0 && (
        <NoInputsDisplay
          isJobInProgress={isImporting}
          importedCount={importedCount}
          totalInputsToBeImported={totalToImport}
          project={project}
          phaseId={phase.id}
          setShowPastInputsModal={setImportOpened}
        />
      )}
      {ideas && pageIdeas.length === 0 && !!phaseTotal && (
        <NoPost handleSeeAll={clearFilters} />
      )}
      {pageIdeas.length > 0 && (
        <StatementTable
          ideas={pageIdeas}
          resultsById={resultsById}
          selectedIds={new Set(selection.selectedIds)}
          openId={previewId}
          dimmed={isChangingList}
          currentPage={page}
          lastPage={lastPage}
          onToggleSelect={selection.toggle}
          onToggleSelectPage={selection.togglePage}
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
          handleDeleted();
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
