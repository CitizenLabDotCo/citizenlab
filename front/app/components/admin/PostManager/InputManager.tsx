import React, { Suspense, lazy, useEffect, useState } from 'react';
import styled from 'styled-components';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { isNilOrError } from 'utils/helperUtils';

// api
import useIdeaStatuses from 'api/idea_statuses/useIdeaStatuses';
import useTopics from 'api/topics/useTopics';
import useProjectAllowedInputTopics from 'api/project_allowed_input_topics/useProjectAllowedInputTopics';

// resources
import { getTopicIds } from 'api/project_allowed_input_topics/util/getProjectTopicsIds';

// components
import ActionBar from './components/ActionBar';
import FilterSidebar from './components/FilterSidebar';
import PostTable from './components/PostTable';
import InfoSidebar from './components/InfoSidebar';
import ExportMenu from './components/ExportMenu';
import IdeasCount from './components/IdeasCount';
import { Input } from 'semantic-ui-react';
import FeedbackToggle from './components/TopLevelFilters/FeedbackToggle';
const LazyPostPreview = lazy(
  () => import('components/admin/PostManager/components/PostPreview')
);

import Outlet from 'components/Outlet';
import { useSearchParams } from 'react-router-dom';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';

// typings
import { IIdeaStatuses } from 'api/idea_statuses/types';
import { IProjectData } from 'api/projects/types';
import { ITopics } from 'api/topics/types';
import { TPhases } from 'api/phases/types';
import useIdeas from 'api/ideas/useIdeas';
import { IQueryParameters, Sort } from 'api/ideas/types';
import { getPageNumberFromUrl, getSortDirection } from 'utils/paginationUtils';

const StyledExportMenu = styled(ExportMenu)`
  margin-left: auto;
`;

const TopActionBar = styled.div`
  display: flex;
  margin-bottom: 20px;
`;

const MiddleColumnTop = styled.div`
  transition: 200ms;
  display: flex;
  justify-content: space-between;
  flex: 1;
`;

const ThreeColumns = styled.div`
  display: flex;
  margin: -10px;
  & > * {
    margin: 10px;
  }
`;

const LeftColumn = styled.div`
  width: 260px;
  min-width: 260px;
`;

const MiddleColumn = styled.div`
  flex: 1;
  transition: 200ms;
`;

export const Sticky = styled.div`
  position: -webkit-sticky;
  position: sticky;
  top: ${(props) => props.theme.menuHeight + 20}px;
`;

const StyledInput = styled(Input)`
  max-width: 260px;
  display: flex;
  width: 100%;
`;

interface InputProps {
  // When the PostManager is used in admin/projects, we pass down the current project id as a prop
  projectId?: string | null;
  // filters settings
  // the filters needed for this view, in the order they'll be shown, first one active by default
  visibleFilterMenus: TFilterMenu[]; // cannot be empty.
  defaultFilterMenu: TFilterMenu;
  phases?: TPhases;
  // When the PostManager is used in admin/posts, the parent component passes
  // down the array of projects the current user can moderate.
  projects?: IProjectData[] | null;
}

interface Props extends InputProps {
  postStatuses?: IIdeaStatuses;
  topicsData?: ITopics['data'];
}

export type TFilterMenu = 'topics' | 'phases' | 'projects' | 'statuses';
export type PreviewMode = 'view' | 'edit';

const PostManager = ({
  defaultFilterMenu,
  visibleFilterMenus,
  projects,
  projectId,
  phases,
}: Props) => {
  const type = projectId ? 'ProjectIdeas' : 'AllIdeas';
  const { data: ideas } = useIdeas({
    'page[size]': 10,
    sort: 'new',
    projects: projectId ? [projectId] : undefined,
    // if we have a projectId, we'll return the correct projects (for which we have moderator rights)
    // without a project, we need this filter?
    filter_can_moderate: projectId ? undefined : true,
  });
  const { data: ideaStatuses } = useIdeaStatuses();
  const { data: ideaTopics } = useTopics({});
  const { data: projectAllowedInputTopics } = useProjectAllowedInputTopics({
    projectId: typeof projectId === 'string' ? projectId : undefined,
  });
  const topicIds = getTopicIds(projectAllowedInputTopics?.data);
  const topicIdsSet = topicIds ? new Set(topicIds) : undefined;

  const getTopicsData = () => {
    if (topicIdsSet) {
      return ideaTopics?.data.filter((topic) => topicIdsSet?.has(topic.id));
    }

    return ideaTopics?.data;
  };

  const topicsData = getTopicsData();
  const [search] = useSearchParams();
  const [selection, setSelection] = useState<Set<string>>(new Set());
  const [queryParameters, setQueryParameters] = useState<IQueryParameters>({});
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

  if (!ideas) return null;

  // Filtering handlers
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
  // End filtering hanlders

  const resetSelection = () => {
    setSelection(new Set());
  };
  // End selection management

  // Filter menu
  const handleChangeActiveFilterMenu = (activeFilterMenu: TFilterMenu) => {
    setActiveFilterMenu(activeFilterMenu);
  };
  // End Filter menu

  // Modal Preview
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
  // End Modal Preview

  const onChangeTopics = (topics: string[]) => {
    setQueryParameters({ ...queryParameters, topics });
  };
  const onChangeStatus = (ideaStatus: string | null) => {
    setQueryParameters({ ...queryParameters, idea_status: ideaStatus });
  };
  const onChangeAssignee = (assignee: string | undefined) => {
    setQueryParameters({ ...queryParameters, assignee });
  };
  const onChangeFeedbackFilter = (feedbackNeeded: boolean) => {
    setQueryParameters({ ...queryParameters, feedback_needed: feedbackNeeded });
  };
  const onChangePhase = (phase: string) => {
    setQueryParameters({
      ...queryParameters,
      phase,
    });
  };

  const onChangeProjects = (projects: string[]) => {
    setQueryParameters({
      ...queryParameters,
      projects,
    });
  };

  const onResetParams = () => {
    setQueryParameters({});
  };

  const onChangePage = (pageNumber: number) => {
    setQueryParameters({ ...queryParameters, 'page[number]': pageNumber });
  };

  const onChangeSearchTerm = (search: string) => {
    setQueryParameters({ ...queryParameters, search });
  };

  const onChangeSorting = (sort: Sort) => {
    setQueryParameters({ ...queryParameters, sort });
  };

  const currentPage = getPageNumberFromUrl(ideas.links.self);
  const lastPage = getPageNumberFromUrl(ideas.links.last);
  const selectedTopics = queryParameters.topics;
  const selectedAssignee = queryParameters.assignee;
  const feedbackNeeded = queryParameters.feedback_needed || false;
  const selectedProjectId = getSelectedProject();
  const selectedPhaseId = queryParameters.phase;
  const selectedStatus = queryParameters.idea_status;

  if (ideas && topicsData) {
    return (
      <>
        <TopActionBar>
          <Outlet
            id="app.components.admin.PostManager.topActionBar"
            assignee={selectedAssignee}
            projectId={type === 'ProjectIdeas' ? projectId : null}
            handleAssigneeFilterChange={onChangeAssignee}
            type={type}
          />
          <FeedbackToggle
            type={type}
            value={feedbackNeeded}
            onChange={onChangeFeedbackFilter}
            project={selectedProjectId}
            phase={selectedPhaseId}
            topics={selectedTopics}
            status={selectedStatus}
            assignee={selectedAssignee}
            searchTerm={queryParameters.search}
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
              type={type}
              selection={selection}
              resetSelection={resetSelection}
              handleClickEdit={openPreviewEdit}
            />
          </LeftColumn>
          <MiddleColumnTop>
            <IdeasCount
              feedbackNeeded={
                feedbackNeeded === true ? feedbackNeeded : undefined
              }
              project={selectedProjectId}
              phase={selectedPhaseId ?? undefined}
              topics={selectedTopics ?? undefined}
              ideaStatusId={selectedStatus ?? undefined}
              search={queryParameters.search}
              assignee={selectedAssignee ?? undefined}
            />
            <StyledInput icon="search" onChange={onChangeSearchTerm} />
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
                selectedTopics={selectedTopics}
                selectedStatus={selectedStatus}
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
                  : 'ascending'
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
              lastPageNumber={
                typeof lastPage === 'number' ? lastPage : undefined
              }
              onChangePage={onChangePage}
              handleSeeAll={onResetParams}
              openPreview={openPreview}
            />
          </MiddleColumn>
          <InfoSidebar postIds={[...selection]} openPreview={openPreview} />
        </ThreeColumns>
        <Suspense fallback={null}>
          <LazyPostPreview
            type={type}
            postId={previewPostId}
            mode={previewMode}
            onClose={closePreview}
            onSwitchPreviewMode={switchPreviewMode}
          />
        </Suspense>
      </>
    );
  }

  return null;
};

export default (inputProps: InputProps) => {
  return (
    <DndProvider backend={HTML5Backend}>
      <PostManager {...inputProps} />
    </DndProvider>
  );
};
