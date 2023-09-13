import React, { Suspense, lazy, useEffect, useState } from 'react';
import { isFunction } from 'lodash-es';
import { adopt } from 'react-adopt';
import styled from 'styled-components';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { isNilOrError } from 'utils/helperUtils';

// api
import { IProjectData } from 'api/projects/types';

// resources
import GetIdeaStatuses, {
  GetIdeaStatusesChildProps,
} from 'resources/GetIdeaStatuses';
import GetInitiativeStatuses, {
  GetInitiativeStatusesChildProps,
} from 'resources/GetInitiativeStatuses';
import GetIdeas, { GetIdeasChildProps } from 'resources/GetIdeas';
import GetInitiatives, {
  GetInitiativesChildProps,
} from 'resources/GetInitiatives';
import { TPhases } from 'api/phases/types';
import GetTopics, { GetTopicsChildProps } from 'resources/GetTopics';
import GetProjectAllowedInputTopics from 'resources/GetProjectAllowedInputTopics';
import { getTopicIds } from 'api/project_allowed_input_topics/util/getProjectTopicsIds';

// components
import ActionBar from './components/ActionBar';
import FilterSidebar from './components/FilterSidebar';
import PostTable from './components/PostTable';
import InfoSidebar from './components/InfoSidebar';
import ExportMenu from './components/ExportMenu';
import IdeasCount from './components/IdeasCount';
import InitiativesCount from './components/InitiativesCount';
import { Input } from 'semantic-ui-react';
import FeedbackToggle from './components/TopLevelFilters/FeedbackToggle';
const LazyPostPreview = lazy(
  () => import('components/admin/PostManager/components/PostPreview')
);

import LazyStatusChangeModal from './components/StatusChangeModal/LazyStatusChangeModal';
import Outlet from 'components/Outlet';
import { useSearchParams } from 'react-router-dom';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';

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

export type ManagerType =
  | 'AllIdeas' // should come with projectIds a list of projects that the current user can manage.
  | 'ProjectIdeas' // should come with projectId
  | 'Initiatives';

interface InputProps {
  // For all display and behaviour that's conditionned by the place this component is rendered
  // this prop is used for the test.
  type: ManagerType;

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

interface DataProps {
  posts: GetIdeasChildProps | GetInitiativesChildProps;
  postStatuses: GetIdeaStatusesChildProps | GetInitiativeStatusesChildProps;
  topics: GetTopicsChildProps;
}

interface Props extends InputProps, DataProps {}

export type TFilterMenu = 'topics' | 'phases' | 'projects' | 'statuses';
export type PreviewMode = 'view' | 'edit';

const PostManager = ({
  defaultFilterMenu,
  visibleFilterMenus,
  posts,
  type,
  projects,
  projectId,
  phases,
  postStatuses,
  topics,
}: Props) => {
  const [search] = useSearchParams();
  const [selection, setSelection] = useState<Set<string>>(new Set());
  const [activeFilterMenu, setActiveFilterMenu] =
    useState<TFilterMenu>(defaultFilterMenu);
  const [searchTerm, setSearchTerm] = useState<string | undefined>(undefined);
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

  // Filtering handlers
  const getSelectedProject = () => {
    if (type === 'Initiatives') return undefined;

    const { queryParameters } = posts as GetIdeasChildProps;
    return Array.isArray(queryParameters.projects) &&
      queryParameters.projects.length === 1
      ? queryParameters.projects[0]
      : undefined;
  };

  const handleSearchChange = (event) => {
    const searchTerm = event.target.value;
    setSearchTerm(searchTerm);

    if (isFunction(posts.onChangeSearchTerm)) {
      posts.onChangeSearchTerm(searchTerm);
    }
  };

  const onChangeProjects = (projectIds: string[] | undefined) => {
    if (type !== 'AllIdeas') return;

    const { onChangeProjects } = posts as GetIdeasChildProps;

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

  const handleChangeSelection = (selection: Set<string>) => {
    setSelection(selection);
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
    setPreviewMode('view');
  };
  // End Modal Preview

  const getNonSharedParams = () => {
    if (type === 'Initiatives') {
      const initiativePosts = posts as GetInitiativesChildProps;
      return {
        onChangePhase: undefined,
        selectedPhaseId: undefined,
        selectedStatus: initiativePosts.queryParameters.initiative_status,
      };
    } else if (type === 'AllIdeas' || type === 'ProjectIdeas') {
      const ideasPosts = posts as GetIdeasChildProps;
      return {
        onChangePhase: ideasPosts.onChangePhase,
        selectedPhaseId: ideasPosts.queryParameters.phase,
        selectedStatus: ideasPosts.queryParameters.idea_status,
      };
    }
    return {
      onChangePhase: () => {},
      selectedPhaseId: null,
      selectedStatus: null,
    };
  };

  const {
    list,
    onChangeTopics,
    onChangeStatus,
    queryParameters,
    onChangeAssignee,
    onChangeFeedbackFilter,
    onResetParams,
  } = posts;

  const selectedTopics = queryParameters.topics;
  const selectedAssignee = queryParameters.assignee;
  const feedbackNeeded = queryParameters.feedback_needed || false;

  const selectedProjectId = getSelectedProject();

  const { onChangePhase, selectedPhaseId, selectedStatus } =
    getNonSharedParams();

  if (!isNilOrError(topics)) {
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
            searchTerm={searchTerm}
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
            {type === 'Initiatives' ? (
              <InitiativesCount
                feedbackNeeded={feedbackNeeded}
                topics={selectedTopics}
                initiativeStatus={selectedStatus}
                searchTerm={searchTerm}
                assignee={selectedAssignee}
              />
            ) : type === 'AllIdeas' || type === 'ProjectIdeas' ? (
              <IdeasCount
                feedbackNeeded={
                  feedbackNeeded === true ? feedbackNeeded : undefined
                }
                project={selectedProjectId}
                phase={selectedPhaseId ?? undefined}
                topics={selectedTopics ?? undefined}
                ideaStatusId={selectedStatus ?? undefined}
                search={searchTerm}
                assignee={selectedAssignee ?? undefined}
              />
            ) : null}
            <StyledInput icon="search" onChange={handleSearchChange} />
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
                statuses={!isNilOrError(postStatuses) ? postStatuses : []}
                topics={topics}
                selectedPhase={selectedPhaseId}
                selectedTopics={selectedTopics}
                selectedStatus={selectedStatus}
                selectedProject={selectedProjectId}
                onChangePhaseFilter={onChangePhase}
                onChangeTopicsFilter={onChangeTopics}
                onChangeStatusFilter={onChangeStatus}
                onChangeProjectFilter={onChangeProjects}
              />
            </Sticky>
          </LeftColumn>
          <MiddleColumn>
            <PostTable
              type={type}
              activeFilterMenu={activeFilterMenu}
              sortAttribute={posts.sortAttribute}
              sortDirection={posts.sortDirection}
              onChangeSort={posts.onChangeSorting}
              posts={list || undefined}
              phases={!isNilOrError(phases) ? phases : undefined}
              statuses={!isNilOrError(postStatuses) ? postStatuses : []}
              selection={selection}
              selectedPhaseId={selectedPhaseId}
              selectedProjectId={selectedProjectId}
              onChangeSelection={handleChangeSelection}
              currentPageNumber={posts.currentPage}
              lastPageNumber={posts.lastPage}
              onChangePage={posts.onChangePage}
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
        {type === 'Initiatives' && (
          <Suspense fallback={null}>
            <LazyStatusChangeModal />
          </Suspense>
        )}
      </>
    );
  }

  return null;
};

const Data = adopt<DataProps, InputProps>({
  posts: ({ type, projectId, render }) => {
    if (type === 'Initiatives') {
      return (
        <GetInitiatives pageSize={10} sort="new">
          {render}
        </GetInitiatives>
      );
    }

    const props = {
      'page[size]': 10,
      sort: 'new',
    } as const;

    if (type === 'ProjectIdeas') {
      return (
        <GetIdeas {...props} projects={projectId ? [projectId] : undefined}>
          {render}
        </GetIdeas>
      );
    }

    if (type === 'AllIdeas') {
      return (
        <GetIdeas {...props} filter_can_moderate={true}>
          {render}
        </GetIdeas>
      );
    }

    return null;
  },
  postStatuses: ({ type, render }) =>
    type === 'Initiatives' ? (
      <GetInitiativeStatuses>{render}</GetInitiativeStatuses>
    ) : (
      <GetIdeaStatuses>{render}</GetIdeaStatuses>
    ),
  topics: ({ type, projectId, render }) => {
    if (type === 'Initiatives') {
      return <GetTopics excludeCode="custom">{render}</GetTopics>;
    }

    if (type === 'ProjectIdeas' && projectId) {
      return (
        <GetProjectAllowedInputTopics projectId={projectId}>
          {(projectAllowedInputTopics) => {
            const topicIds = getTopicIds(projectAllowedInputTopics);

            return <GetTopics topicIds={topicIds}>{render}</GetTopics>;
          }}
        </GetProjectAllowedInputTopics>
      );
    }

    if (type === 'AllIdeas') {
      return <GetTopics>{render}</GetTopics>;
    }

    return null;
  },
});

export default (inputProps: InputProps) => {
  return (
    <DndProvider backend={HTML5Backend}>
      <Data {...inputProps}>
        {(dataProps) => <PostManager {...inputProps} {...dataProps} />}
      </Data>
    </DndProvider>
  );
};
