import React, { useState } from 'react';

import { Box, Button, Spinner, Text } from '@citizenlab/cl2-component-library';
import { useQueryClient } from '@tanstack/react-query';

import commonGroundResultsKeys from 'api/common_ground/keys/commonGroundResultsKeys';
import useCommonGroundResults from 'api/common_ground/useCommonGroundResults';
import useCopyInputs from 'api/copy_inputs/useCopyInputs';
import useJobInProgressByPhase from 'api/copy_inputs/useJobInProgressByPhase';
import useAddIdea from 'api/ideas/useAddIdea';
import useIdeas from 'api/ideas/useIdeas';
import useUpdateIdea from 'api/ideas/useUpdateIdea';
import useIdeasFilterCounts from 'api/ideas_filter_counts/useIdeasFilterCounts';
import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

import useLocalize from 'hooks/useLocalize';

import inputManagerMessages from 'components/admin/PostManager/CommonGroundInputManager/messages';
import NoInputsDisplay from 'components/admin/PostManager/CommonGroundInputManager/NoInputsDisplay';
import NoPost from 'components/admin/PostManager/components/PostTable/NoPost';
import Warning from 'components/UI/Warning';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

import FilterMenu from '../InputManager/FilterMenu';
import FilterChips from '../InputManager/FilterMenu/FilterChips';
import SearchToggle from '../InputManager/SearchToggle';
import { actionRowProps } from '../InputManager/SideColumn/actionRowProps';
import Card from '../InputManager/SideColumn/Card';
import ExportRow from '../InputManager/SideColumn/ExportRow';
import SidePanel from '../InputManager/SidePanel';
import usePanelNavigation from '../InputManager/usePanelNavigation';
import useSelection from '../InputManager/useSelection';
import AddInputModal from '../Phase/BuildPanel/BuildFields/MethodSection/AddInputModal';
import ImportInputsModal from '../Phase/BuildPanel/BuildFields/MethodSection/CommonGroundSection/ImportInputsModal';
import ManageLayout from '../Phase/ManageLayout';

import messages from './messages';
import StatementBatchBar from './StatementBatchBar';
import StatementStats from './StatementStats';
import StatementTable from './StatementTable';
import useAgreementFilter from './useAgreementFilter';
import { totalReactions } from './utils';

const PAGE_SIZE = 20;

interface Props {
  project: IProjectData;
  phase: IPhaseData;
}

const CommonGroundManager = ({ project, phase }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState<string>();
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [importOpened, setImportOpened] = useState(false);
  const [addOpened, setAddOpened] = useState(false);
  const { mutateAsync: addIdea } = useAddIdea();
  const { mutateAsync: updateIdea } = useUpdateIdea();
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
        <>
          {stats && (
            <StatementStats
              statements={phaseTotal ?? stats.num_ideas}
              reactions={totalReactions(stats.votes)}
              participants={stats.num_participants}
            />
          )}
          <Card fillHeight>
            <Button
              {...actionRowProps}
              icon="plus"
              onClick={() => setAddOpened(true)}
            >
              {formatMessage(messages.addStatement)}
            </Button>
            <Button
              {...actionRowProps}
              icon="upload-file"
              onClick={() => setImportOpened(true)}
            >
              {formatMessage(messages.importInputs)}
            </Button>
            <ExportRow
              type="ProjectProposals"
              projectId={project.id}
              selectedIds={selection.selectedIds}
            />
          </Card>
        </>
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
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        gap="12px"
        minHeight="40px"
        mb="12px"
      >
        {selection.selectedIdeas.length > 0 ? (
          <StatementBatchBar
            ideas={selection.selectedIdeas}
            total={listedTotal}
            onEdit={setEditingId}
            onClear={selection.clear}
            onDeleted={handleDeleted}
            onSelectAll={selection.selectAll}
            isSelectingAll={selection.isSelectingAll}
            selectAllFailed={selection.selectAllFailed}
          />
        ) : (
          <Text variant="boLabel" m="0">
            {listedTotal !== undefined &&
              formatMessage(messages.statementCount, { count: listedTotal })}
          </Text>
        )}
        <Box display="flex" alignItems="center" gap="8px">
          <SearchToggle
            label={formatMessage(messages.searchStatements)}
            searchTerm={search}
            onChange={changeSearch}
            resultCount={listedTotal ?? 0}
          />
          <FilterMenu
            categories={[agreementCategory]}
            onClearAll={clearFilters}
          />
        </Box>
      </Box>
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
        <AddInputModal
          phaseId={phase.id}
          kind="statement"
          header={formatMessage(messages.editStatement)}
          submitLabel={formatMessage(messages.saveStatement)}
          defaultValues={{
            title_multiloc: editingIdea.attributes.title_multiloc,
            author_id: editingIdea.relationships.author?.data?.id,
            anonymous: editingIdea.attributes.anonymous,
          }}
          onSubmit={(values) =>
            updateIdea({ id: editingIdea.id, requestBody: values }).then(
              refreshResults
            )
          }
          onClose={() => setEditingId(null)}
        />
      )}
      {addOpened && (
        <AddInputModal
          phaseId={phase.id}
          kind="statement"
          onSubmit={(values) =>
            addIdea({
              phaseId: phase.id,
              requestBody: { ...values, publication_status: 'published' },
            }).then(refreshResults)
          }
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
