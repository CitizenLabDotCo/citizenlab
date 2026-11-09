import React, { useState } from 'react';

import { Box, Button, Spinner, Text } from '@citizenlab/cl2-component-library';
import { useQueryClient } from '@tanstack/react-query';

import commonGroundResultsKeys from 'api/common_ground/keys/commonGroundResultsKeys';
import useCommonGroundResults from 'api/common_ground/useCommonGroundResults';
import useCopyInputs from 'api/copy_inputs/useCopyInputs';
import useJobInProgressByPhase from 'api/copy_inputs/useJobInProgressByPhase';
import { IIdeaData } from 'api/ideas/types';
import useAddIdea from 'api/ideas/useAddIdea';
import useIdeas from 'api/ideas/useIdeas';
import useUpdateIdea from 'api/ideas/useUpdateIdea';
import useIdeasFilterCounts from 'api/ideas_filter_counts/useIdeasFilterCounts';
import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

import inputManagerMessages from 'components/admin/PostManager/CommonGroundInputManager/messages';
import NoInputsDisplay from 'components/admin/PostManager/CommonGroundInputManager/NoInputsDisplay';
import PostPreview from 'components/admin/PostManager/components/PostPreview';
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
import useSelectAll from '../InputManager/useSelectAll';
import AddInputModal from '../Phase/BuildPanel/BuildFields/MethodSection/AddInputModal';
import ImportInputsModal from '../Phase/BuildPanel/BuildFields/MethodSection/CommonGroundSection/ImportInputsModal';
import ManageLayout from '../Phase/ManageLayout';

import messages from './messages';
import StatementBatchBar from './StatementBatchBar';
import StatementStats from './StatementStats';
import StatementTable from './StatementTable';
import useAgreementFilter from './useAgreementFilter';

const PAGE_SIZE = 20;

interface Props {
  project: IProjectData;
  phase: IPhaseData;
}

const CommonGroundManager = ({ project, phase }: Props) => {
  const { formatMessage } = useIntl();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState<string>();
  const [selection, setSelection] = useState<Map<string, IIdeaData>>(new Map());
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [importOpened, setImportOpened] = useState(false);
  const [addOpened, setAddOpened] = useState(false);
  const { mutate: addIdea } = useAddIdea();
  const { mutate: updateIdea } = useUpdateIdea();
  const { mutate: copyInputs } = useCopyInputs();

  const { data: results } = useCommonGroundResults(phase.id);
  const statements = results?.data.attributes.ideas_by_agreement ?? [];
  const { category: agreementCategory, ideaIds } = useAgreementFilter(
    statements,
    () => setPage(1)
  );

  const scope = {
    projects: [project.id],
    phase: phase.id,
    transitive: false,
  };
  const listed = { ...scope, search, ideas: ideaIds };
  const { data: ideas, isPlaceholderData: isChangingList } = useIdeas({
    ...listed,
    sort: 'new',
    'page[size]': PAGE_SIZE,
    'page[number]': page,
  });
  const { data: allCounts } = useIdeasFilterCounts(scope);
  const { data: listedCounts } = useIdeasFilterCounts(listed);
  const { data: importJob } = useJobInProgressByPhase(phase.id);
  const { selectAll, isSelectingAll } = useSelectAll(listed, (allIdeas) =>
    setSelection(new Map(allIdeas.map((idea) => [idea.id, idea])))
  );

  const { progress: importedCount, total: totalToImport } =
    importJob?.data[0]?.attributes ?? {};
  const isImporting = importedCount !== undefined;

  const stats = results?.data.attributes.stats;
  const votesById = new Map(statements.map(({ id, votes }) => [id, votes]));
  const listedTotal = listedCounts?.data.attributes.total;
  const pageIdeas = ideas?.data ?? [];
  const lastPage = (ideas && getPageNumberFromUrl(ideas.links.last)) || 1;
  const hasFilters = !!search || agreementCategory.isActive;
  const selectedIdeas = [...selection.values()];
  // The listed version first: a selected one can predate an earlier edit.
  const editingIdea =
    pageIdeas.find((idea) => idea.id === editingId) ??
    (editingId ? selection.get(editingId) : undefined);

  const changeSearch = (term: string | null) => {
    setSearch(term || undefined);
    setPage(1);
  };

  const clearFilters = () => {
    agreementCategory.clear();
    changeSearch(null);
  };

  const toggleSelect = (idea: IIdeaData) => {
    const next = new Map(selection);
    if (!next.delete(idea.id)) next.set(idea.id, idea);
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

  const handleDeleted = () => {
    setSelection(new Map());
    queryClient.invalidateQueries({
      queryKey: commonGroundResultsKeys.all(),
    });
  };

  return (
    <ManageLayout
      side={
        <>
          {stats && (
            <StatementStats
              statements={allCounts?.data.attributes.total ?? stats.num_ideas}
              reactions={
                stats.votes.up + stats.votes.down + stats.votes.neutral
              }
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
              selectedIds={[...selection.keys()]}
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
        {selectedIdeas.length > 0 ? (
          <StatementBatchBar
            ideas={selectedIdeas}
            total={listedTotal}
            onEdit={setEditingId}
            onClear={() => setSelection(new Map())}
            onDeleted={handleDeleted}
            onSelectAll={selectAll}
            isSelectingAll={isSelectingAll}
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
      {ideas && pageIdeas.length === 0 && !hasFilters && (
        <NoInputsDisplay
          isJobInProgress={isImporting}
          importedCount={importedCount}
          totalInputsToBeImported={totalToImport}
          project={project}
          phaseId={phase.id}
          setShowPastInputsModal={setImportOpened}
        />
      )}
      {ideas && pageIdeas.length === 0 && hasFilters && (
        <NoPost handleSeeAll={clearFilters} />
      )}
      {pageIdeas.length > 0 && (
        <StatementTable
          ideas={pageIdeas}
          votesById={votesById}
          selectedIds={new Set(selection.keys())}
          openId={previewId}
          dimmed={isChangingList}
          currentPage={page}
          lastPage={lastPage}
          onToggleSelect={toggleSelect}
          onToggleSelectPage={toggleSelectPage}
          onOpen={setPreviewId}
          onChangePage={setPage}
        />
      )}

      <PostPreview
        type="ProjectIdeas"
        postId={previewId}
        selectedPhaseId={phase.id}
        mode="view"
        onClose={() => setPreviewId(null)}
        onSwitchPreviewMode={() => setEditingId(previewId)}
      />
      {editingIdea && (
        <AddInputModal
          phaseId={phase.id}
          kind="statement"
          header={formatMessage(messages.editStatement)}
          submitLabel={formatMessage(messages.saveStatement)}
          defaultValues={{
            title_multiloc: editingIdea.attributes.title_multiloc,
            author_id: editingIdea.relationships.author?.data?.id ?? null,
            anonymous: editingIdea.attributes.anonymous,
          }}
          onSubmit={(values) =>
            updateIdea({ id: editingIdea.id, requestBody: values })
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
            })
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
