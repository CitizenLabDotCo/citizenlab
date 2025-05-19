import React, { useEffect, useState } from 'react';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useSearchParams } from 'react-router-dom';

import useIdeaStatuses from 'api/idea_statuses/useIdeaStatuses';
import { IIdeaQueryParameters, Sort } from 'api/ideas/types';
import useIdeas from 'api/ideas/useIdeas';
import { TPhases } from 'api/phases/types';
import useProjectAllowedInputTopics from 'api/project_allowed_input_topics/useProjectAllowedInputTopics';
import { getTopicIds } from 'api/project_allowed_input_topics/util/getProjectTopicsIds';
import { IProjectData } from 'api/projects/types';
import useTopics from 'api/topics/useTopics';

import PostPreview from 'components/admin/PostManager/components/PostPreview';
import Outlet from 'components/Outlet';
import SearchInput from 'components/UI/SearchInput';

import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { isNilOrError } from 'utils/helperUtils';
import { getPageNumberFromUrl, getSortDirection } from 'utils/paginationUtils';

import ActionBar from './components/ActionBar';
import FilterSidebar from './components/FilterSidebar';
import IdeasCount from './components/IdeasCount';
import PostTable from './components/PostTable';
import IdeaFeedbackToggle from './components/TopLevelFilters/IdeaFeedbackToggle';

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
  const [queryParameters, setQueryParameters] = useState<IIdeaQueryParameters>({
    'page[size]': 10,
    sort: 'new',
    projects: projectId ? [projectId] : undefined,
    // if we have a projectId, we'll return the correct projects (for which we have moderator rights)
    // without a project, we need this filter?
    filter_can_moderate: projectId ? undefined : true,
    phase: phaseId ? phaseId : undefined,
    transitive: true,
  });
  const { data: ideas } = useIdeas(queryParameters);
  const { data: ideaStatuses } = useIdeaStatuses({
    queryParams: { participation_method: 'ideation' },
  });
  const { data: ideaTopics } = useTopics();
  const { data: projectAllowedInputTopics } = useProjectAllowedInputTopics({
    projectId:
      type === 'ProjectIdeas' && typeof projectId === 'string'
        ? projectId
        : undefined,
  });

  const getTopicsData = () => {
    const topicIds = getTopicIds(projectAllowedInputTopics?.data);
    // getTopicIds always returns an array atm, so important to check for length
    // otherwise the if condition will always pass.
    const topicIdsSet = topicIds.length > 0 ? new Set(topicIds) : undefined;

    if (topicIdsSet) {
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      return ideaTopics?.data.filter((topic) => topicIdsSet?.has(topic.id));
    }

    return ideaTopics?.data;
  };

  const topicsData = getTopicsData();
  const [search] = useSearchParams();
  const [selection, setSelection] = useState<Set<string>>(new Set());

  const [activeFilterMenu, setActiveFilterMenu] =
    useState<TFilterMenu>(defaultFilterMenu);
  const [previewPostId, setPreviewPostId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('view');

  useEffect(() => {
    if (search.get('selected_idea_id')) {
      setPreviewMode('view');
      setPreviewPostId(search.get('selected_idea_id'));
    }
    removeSearchParams(['selected_idea_id']);
  }, [search]);

  useEffect(() => {
    setActiveFilterMenu((activeFilterMenu) => {
      if (
        !visibleFilterMenus.find((item) => item === activeFilterMenu) &&
        visibleFilterMenus[0]
      ) {
        return visibleFilterMenus[0];
      } else {
        return activeFilterMenu;
      }
    });
  }, [visibleFilterMenus]);

  if (!ideas || !topicsData) return null;

  const getSelectedProject = () => {
    return Array.isArray(queryParameters.projects) &&
      queryParameters.projects.length === 1
      ? queryParameters.projects[0]
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

  const handleChangeActiveFilterMenu = (activeFilterMenu: TFilterMenu) => {
    setActiveFilterMenu(activeFilterMenu);
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
    setQueryParameters({ ...queryParameters, 'page[number]': 1, topics });
  };

  const onChangeStatus = (ideaStatus: string | undefined) => {
    setQueryParameters({
      ...queryParameters,
      'page[number]': 1,
      idea_status: ideaStatus,
    });
  };

  const onChangeAssignee = (assignee: string | undefined) => {
    setQueryParameters({ ...queryParameters, 'page[number]': 1, assignee });
  };

  const onChangeFeedbackFilter = (feedbackNeeded: boolean | undefined) => {
    setQueryParameters({
      ...queryParameters,
      'page[number]': 1,
      feedback_needed: feedbackNeeded,
    });
  };

  const onChangePhase = (phase: string) => {
    setQueryParameters({
      ...queryParameters,
      'page[number]': 1,
      phase,
    });
  };

  const onChangeProjects = (projects: string[]) => {
    setQueryParameters({
      ...queryParameters,
      'page[number]': 1,
      projects,
    });
  };

  const onResetParams = () => {
    setQueryParameters(
      // Don't reset the project filter OR phase filter if we're in the project input manager
      // or all ideas (including from other projects) will be visible.
      type === 'ProjectIdeas' && typeof projectId === 'string'
        ? {
            projects: [projectId],
            phase: queryParameters.phase,
          }
        : {}
    );
  };

  const onChangePage = (pageNumber: number) => {
    setQueryParameters({ ...queryParameters, 'page[number]': pageNumber });
  };

  const onChangeSearchTerm = (value: string | null) => {
    setQueryParameters({
      ...queryParameters,
      'page[number]': 1,
      search: value || undefined,
    });
  };

  const onChangeSorting = (sort: Sort) => {
    setQueryParameters({ ...queryParameters, 'page[number]': 1, sort });
  };

  const currentPage = getPageNumberFromUrl(ideas.links.self);
  const lastPage = getPageNumberFromUrl(ideas.links.last);
  const selectedProjectId = getSelectedProject();
  const selectedPhaseId = queryParameters.phase;

  return (
    <>
      <TopActionBar>
        <Outlet
          id="app.components.admin.PostManager.topActionBar"
          assignee={queryParameters.assignee}
          projectId={type === 'ProjectIdeas' ? projectId : null}
          handleAssigneeFilterChange={onChangeAssignee}
          type={type}
        />
        <IdeaFeedbackToggle
          value={queryParameters.feedback_needed || false}
          onChange={onChangeFeedbackFilter}
          project={selectedProjectId}
          queryParameters={queryParameters}
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
          <IdeasCount
            project={selectedProjectId}
            queryParameters={queryParameters}
          />
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
              selectedTopics={queryParameters.topics}
              selectedStatus={queryParameters.idea_status}
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
            sortAttribute={queryParameters.sort}
            sortDirection={
              queryParameters.sort
                ? getSortDirection(queryParameters.sort)
                : 'descending'
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
