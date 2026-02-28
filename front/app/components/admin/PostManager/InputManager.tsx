import React, { useEffect, useState } from 'react';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import useIdeaStatuses from 'api/idea_statuses/useIdeaStatuses';
import { Sort } from 'api/ideas/types';
import useIdeas from 'api/ideas/useIdeas';
import useInputTopics from 'api/input_topics/useInputTopics';
import { TPhases } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

import PostPreview from 'components/admin/PostManager/components/PostPreview';
import Outlet from 'components/Outlet';
import SearchInput from 'components/UI/SearchInput';

import { isNilOrError } from 'utils/helperUtils';
import { getPageNumberFromUrl, getSortDirection } from 'utils/paginationUtils';

import ActionBar from './components/ActionBar';
import FilterSidebar from './components/FilterSidebar';
import IdeasCount from './components/IdeasCount';
import PostTable from './components/PostTable';
import IdeaFeedbackToggle from './components/TopLevelFilters/IdeaFeedbackToggle';
import useInputManagerSearchParams from './useInputManagerSearchParams';

import {
  LeftColumn,
  MiddleColumn,
  MiddleColumnTop,
  PreviewMode,
  Sticky,
  StyledExportMenu,
  ThreeColumns,
  TopActionBar,
} from '.';

interface Props {
  // When the PostManager is used in /admin/projects, we pass down the current project id as a prop
  projectId?: string | null;
  phaseId?: string;
  visibleFilterMenus: TFilterMenu[]; // cannot be empty.
  defaultFilterMenu: TFilterMenu;
  phases?: TPhases;
  // When the PostManager is used in /admin/ideas, the parent component passes
  // down the array of projects the current user can moderate.
  projects?: IProjectData[] | null;
}

export type TFilterMenu = 'topics' | 'phases' | 'projects' | 'statuses';

const InputManager = ({
  defaultFilterMenu,
  visibleFilterMenus,
  projects,
  projectId,
  phases,
  phaseId,
}: Props) => {
  const type = projectId ? 'ProjectIdeas' : 'AllIdeas';
  const { params, setParams, resetParams } = useInputManagerSearchParams({
    projectId,
    phaseId,
  });

  const { data: ideas } = useIdeas({
    ...params,
    'page[size]': 10,
    filter_can_moderate: projectId ? undefined : true,
    transitive: true,
  });
  const { data: ideaStatuses } = useIdeaStatuses({
    queryParams: { participation_method: 'ideation' },
  });
  // Input topics are project-specific, so we only load them when viewing a specific project
  const { data: inputTopics } = useInputTopics(
    type === 'ProjectIdeas' && typeof projectId === 'string'
      ? projectId
      : undefined
  );

  const topicsData = inputTopics?.data;
  const [selection, setSelection] = useState<Set<string>>(new Set());

  const [previewMode, setPreviewMode] = useState<PreviewMode>('view');
  const [previewPostId, setPreviewPostId] = useState<string | null>(
    params.selected_idea_id ?? null
  );

  useEffect(() => {
    if (params.selected_idea_id) setParams({ selected_idea_id: undefined });
  }, [params.selected_idea_id, setParams]);

  const activeFilterMenu =
    params.tab && visibleFilterMenus.includes(params.tab)
      ? params.tab
      : defaultFilterMenu;

  if (!ideas) return null;

  const getSelectedProject = () => {
    return Array.isArray(params.projects) && params.projects.length === 1
      ? params.projects[0]
      : undefined;
  };

  const handleOnChangeProjects = (projectIds: string[] | undefined) => {
    if (type !== 'AllIdeas') return;

    const accessibleProjectsIds = projects
      ? projects.map((project) => project.id)
      : null;

    if (!projectIds || projectIds.length === 0) {
      accessibleProjectsIds && onChangeProjects(accessibleProjectsIds);
    } else {
      onChangeProjects(projectIds);
    }
  };

  const resetSelection = () => {
    setSelection(new Set());
  };

  const handleChangeActiveFilterMenu = (newTab: TFilterMenu) => {
    setParams({ tab: newTab });
  };

  const openPreview = (postId: string) => {
    setPreviewPostId(postId);
    setPreviewMode('view');
  };

  const openPreviewEdit = () => {
    const previewPostId = [...selection][0];
    if (selection.size === 1 && previewPostId) {
      setPreviewMode('edit');
      setPreviewPostId(previewPostId);
    }
  };

  const switchPreviewMode = () => {
    if (previewMode === 'edit') {
      setPreviewMode('view');
    } else {
      setPreviewMode('edit');
    }
  };

  const closePreview = () => {
    setPreviewPostId(null);
    setPreviewMode('view');
  };

  const onChangeTopics = (topics: string[]) => {
    setParams({ 'page[number]': 1, input_topics: topics });
  };

  const onChangeStatus = (ideaStatus: string | undefined) => {
    setParams({ 'page[number]': 1, idea_status: ideaStatus });
  };

  const onChangeAssignee = (assignee: string | undefined) => {
    setParams({ 'page[number]': 1, assignee });
  };

  const onChangeFeedbackFilter = (feedbackNeeded: boolean | undefined) => {
    setParams({ 'page[number]': 1, feedback_needed: feedbackNeeded });
  };

  const onChangePhase = (phase: string) => {
    setParams({ 'page[number]': 1, phase });
  };

  const onChangeProjects = (projects: string[]) => {
    setParams({ 'page[number]': 1, projects });
  };

  const onChangePage = (pageNumber: number) => {
    setParams({ 'page[number]': pageNumber });
  };

  const onChangeSearchTerm = (value: string | null) => {
    setParams({ 'page[number]': 1, search: value || undefined });
  };

  const onChangeSorting = (sort: Sort) => {
    setParams({ 'page[number]': 1, sort });
  };

  const onResetParams = () => {
    resetParams();
  };

  const currentPage = getPageNumberFromUrl(ideas.links.self);
  const lastPage = getPageNumberFromUrl(ideas.links.last);
  const selectedProjectId = getSelectedProject();
  const selectedPhaseId = params.phase;

  return (
    <>
      <TopActionBar>
        <Outlet
          id="app.components.admin.PostManager.topActionBar"
          assignee={params.assignee}
          projectId={type === 'ProjectIdeas' ? projectId : null}
          handleAssigneeFilterChange={onChangeAssignee}
          type={type}
        />
        <IdeaFeedbackToggle
          value={params.feedback_needed || false}
          onChange={onChangeFeedbackFilter}
          project={selectedProjectId}
          queryParameters={params}
        />
        <StyledExportMenu
          type={type}
          selection={selection}
          selectedProject={selectedProjectId}
        />
      </TopActionBar>

      <ThreeColumns>
        <LeftColumn>
          <ActionBar
            selection={selection}
            resetSelection={resetSelection}
            handleClickEdit={openPreviewEdit}
          />
        </LeftColumn>
        <MiddleColumnTop>
          <IdeasCount project={selectedProjectId} queryParameters={params} />
          <SearchInput
            debounce={1500}
            onChange={onChangeSearchTerm}
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            a11y_numberOfSearchResults={ideas?.data.length}
          />
        </MiddleColumnTop>
      </ThreeColumns>
      <ThreeColumns>
        <LeftColumn>
          <Sticky>
            <FilterSidebar
              type={type}
              activeFilterMenu={activeFilterMenu}
              visibleFilterMenus={visibleFilterMenus}
              onChangeActiveFilterMenu={handleChangeActiveFilterMenu}
              phases={!isNilOrError(phases) ? phases : undefined}
              projects={!isNilOrError(projects) ? projects : undefined}
              statuses={ideaStatuses?.data ?? []}
              topics={topicsData}
              selectedPhase={selectedPhaseId}
              selectedTopics={params.input_topics}
              selectedStatus={params.idea_status}
              selectedProject={selectedProjectId}
              onChangePhaseFilter={onChangePhase}
              onChangeTopicsFilter={onChangeTopics}
              onChangeStatusFilter={onChangeStatus}
              onChangeProjectFilter={handleOnChangeProjects}
            />
          </Sticky>
        </LeftColumn>
        <MiddleColumn>
          <PostTable
            type={type}
            activeFilterMenu={activeFilterMenu}
            sortAttribute={params.sort}
            sortDirection={
              params.sort ? getSortDirection(params.sort) : 'descending'
            }
            onChangeSort={onChangeSorting}
            posts={ideas.data}
            phases={!isNilOrError(phases) ? phases : undefined}
            statuses={ideaStatuses?.data ?? []}
            selection={selection}
            selectedPhaseId={selectedPhaseId}
            selectedProjectId={selectedProjectId}
            onChangeSelection={setSelection}
            currentPageNumber={
              typeof currentPage === 'number' ? currentPage : undefined
            }
            lastPageNumber={typeof lastPage === 'number' ? lastPage : undefined}
            onChangePage={onChangePage}
            handleSeeAll={onResetParams}
            openPreview={openPreview}
          />
        </MiddleColumn>
      </ThreeColumns>
      <PostPreview
        type={type}
        postId={previewPostId}
        selectedPhaseId={selectedPhaseId}
        mode={previewMode}
        onClose={closePreview}
        onSwitchPreviewMode={switchPreviewMode}
      />
    </>
  );
};

export default (inputProps: Props) => {
  return (
    <DndProvider backend={HTML5Backend}>
      <InputManager {...inputProps} />
    </DndProvider>
  );
};
