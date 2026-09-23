import React, { useEffect, useState } from 'react';

import {
  Box,
  Button,
  colors,
  stylingConsts,
  Text,
  Title,
} from '@citizenlab/cl2-component-library';

import useIdeaStatuses from 'api/idea_statuses/useIdeaStatuses';
import useIdeas from 'api/ideas/useIdeas';
import useInputTopics from 'api/input_topics/useInputTopics';
import { IPhaseData } from 'api/phases/types';
import usePhases from 'api/phases/usePhases';
import { IProjectData } from 'api/projects/types';
import useUsers from 'api/users/useUsers';

import { PreviewMode } from 'components/admin/PostManager';
import PostPreview from 'components/admin/PostManager/components/PostPreview';
import useInputManagerSearchParams from 'components/admin/PostManager/useInputManagerSearchParams';
import Pagination from 'components/Pagination';

import { useIntl } from 'utils/cl-intl';
import { getPageNumberFromUrl } from 'utils/paginationUtils';
import { getFullName } from 'utils/textUtils';

import BulkBar from './BulkBar';
import IdeaDrawer from './Drawer';
import IdeaListRow from './IdeaListRow';
import ListToolbar from './ListToolbar';
import ManagePanel from './ManagePanel';
import messages from './messages';

const PAGE_SIZE = 10;
const PANEL_WIDTH = '384px';

interface Props {
  project: IProjectData;
  phase: IPhaseData;
}

const ManageIdeas = ({ project, phase }: Props) => {
  const { formatMessage } = useIntl();
  const { params, setParams, resetParams } = useInputManagerSearchParams({
    projectId: project.id,
    phaseId: phase.id,
  });
  const { data: ideas } = useIdeas({
    ...params,
    'page[size]': PAGE_SIZE,
    transitive: true,
  });
  const { data: statuses } = useIdeaStatuses({
    queryParams: { participation_method: 'ideation' },
  });
  const { data: topics } = useInputTopics(project.id);
  const { data: phases } = usePhases(project.id);
  const { data: moderators } = useUsers({ can_moderate_project: project.id });

  const [selecting, setSelecting] = useState(false);
  const [selection, setSelection] = useState<Set<string>>(new Set());
  const [drawerIdeaId, setDrawerIdeaId] = useState<string | null>(
    params.selected_idea_id ?? null
  );
  const [fullViewIdeaId, setFullViewIdeaId] = useState<string | null>(null);
  const [fullViewMode, setFullViewMode] = useState<PreviewMode>('view');

  useEffect(() => {
    if (params.selected_idea_id) setParams({ selected_idea_id: undefined });
  }, [params.selected_idea_id, setParams]);

  if (!ideas || !statuses) return null;

  const statusList = statuses.data;
  const topicList = topics?.data ?? [];
  const assigneeNames = new Map(
    (moderators?.data ?? []).map((user) => [user.id, getFullName(user)])
  );
  const pageIds = ideas.data.map((idea) => idea.id);
  const allOnPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selection.has(id));
  const currentPage = getPageNumberFromUrl(ideas.links.self) ?? 1;
  const lastPage = getPageNumberFromUrl(ideas.links.last) ?? 1;

  const toggleSelected = (ideaId: string) => {
    const next = new Set(selection);
    if (!next.delete(ideaId)) next.add(ideaId);
    setSelection(next);
  };

  const toggleAllOnPage = () =>
    setSelection(allOnPageSelected ? new Set() : new Set(pageIds));

  // Selection is per page: the bulk bar acts on the loaded ideas.
  const filter = (newParams: Parameters<typeof setParams>[0]) => {
    setSelection(new Set());
    setParams({ 'page[number]': 1, ...newParams });
  };

  const openFullView = (ideaId: string) => {
    setDrawerIdeaId(null);
    setFullViewMode('view');
    setFullViewIdeaId(ideaId);
  };

  return (
    <Box display="flex" flexGrow={1} minHeight="0" bgColor={colors.background}>
      <Box flexGrow={1} minWidth="0" overflowY="auto" p="24px">
        <Box
          p="20px"
          bgColor={colors.white}
          borderRadius={stylingConsts.borderRadius}
          border={`1px solid ${colors.grey200}`}
        >
          <Title variant="h5" as="h2" m="0" color="textPrimary">
            {formatMessage(messages.listTitle)}
          </Title>
          <Text m="0" mt="4px" mb="16px" fontSize="s" color="textSecondary">
            {formatMessage(messages.listSubtitle)}
          </Text>

          <ListToolbar
            projectId={project.id}
            statuses={statusList}
            topics={topicList}
            sort={params.sort ?? 'new'}
            status={params.idea_status}
            topic={params.input_topics?.[0]}
            assignee={params.assignee}
            allPhases={!params.phase}
            resultCount={ideas.data.length}
            selecting={selecting}
            onChangeSearch={(search) => filter({ search: search || undefined })}
            onChangeSort={(sort) => filter({ sort })}
            onChangeStatus={(idea_status) => filter({ idea_status })}
            onChangeTopic={(topic) =>
              filter({ input_topics: topic ? [topic] : undefined })
            }
            onChangeAssignee={(assignee) => filter({ assignee })}
            onChangeAllPhases={(all) =>
              filter({ phase: all ? undefined : phase.id })
            }
            onToggleSelecting={() => {
              setSelection(new Set());
              setSelecting(!selecting);
            }}
          />

          {selecting && (
            <Box mt="12px">
              <BulkBar
                selectedIdeas={ideas.data.filter((idea) =>
                  selection.has(idea.id)
                )}
                allSelected={allOnPageSelected}
                onToggleAll={toggleAllOnPage}
                statuses={statusList}
                topics={topicList}
                onDeleted={() => setSelection(new Set())}
              />
            </Box>
          )}

          {ideas.data.length > 0 ? (
            <>
              <Box mt="8px" />
              {ideas.data.map((idea) => {
                const assigneeId = idea.relationships.assignee?.data?.id;

                return (
                  <IdeaListRow
                    key={idea.id}
                    idea={idea}
                    statuses={statusList}
                    topics={topicList}
                    assigneeName={
                      assigneeId ? assigneeNames.get(assigneeId) : undefined
                    }
                    selecting={selecting}
                    selected={selection.has(idea.id)}
                    open={drawerIdeaId === idea.id}
                    onToggleSelected={() => toggleSelected(idea.id)}
                    onOpen={() => setDrawerIdeaId(idea.id)}
                  />
                );
              })}
              {lastPage > 1 && (
                <Box display="flex" justifyContent="center" mt="16px">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={lastPage}
                    loadPage={(page) => {
                      setSelection(new Set());
                      setParams({ 'page[number]': page });
                    }}
                  />
                </Box>
              )}
            </>
          ) : (
            <Box py="40px" style={{ textAlign: 'center' }}>
              <Text color="textSecondary">
                {formatMessage(messages.noIdeas)}
              </Text>
              <Button
                buttonStyle="secondary-outlined"
                width="auto"
                onClick={resetParams}
              >
                {formatMessage(messages.resetFilters)}
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      <Box
        flex={`0 0 ${PANEL_WIDTH}`}
        width={PANEL_WIDTH}
        overflowY="auto"
        bgColor={colors.white}
        borderLeft={`1px solid ${colors.grey200}`}
      >
        <ManagePanel
          project={project}
          phase={phase}
          statuses={statusList}
          selection={selection}
          feedbackNeeded={!!params.feedback_needed}
          onToggleFeedbackNeeded={() =>
            filter({ feedback_needed: !params.feedback_needed })
          }
        />
      </Box>

      <IdeaDrawer
        ideaId={drawerIdeaId}
        projectId={project.id}
        phases={phases?.data ?? []}
        statuses={statusList}
        topics={topicList}
        onClose={() => setDrawerIdeaId(null)}
        onOpenFullView={openFullView}
      />

      <PostPreview
        type="ProjectIdeas"
        postId={fullViewIdeaId}
        selectedPhaseId={phase.id}
        mode={fullViewMode}
        onClose={() => setFullViewIdeaId(null)}
        onSwitchPreviewMode={() =>
          setFullViewMode((mode) => (mode === 'edit' ? 'view' : 'edit'))
        }
      />
    </Box>
  );
};

export default ManageIdeas;
