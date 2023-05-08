import React, { Suspense } from 'react';
import { isFunction } from 'lodash-es';
import { adopt } from 'react-adopt';
import styled from 'styled-components';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { isNilOrError } from 'utils/helperUtils';
import { IProjectData } from 'services/projects';

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
import { TPhases } from 'hooks/usePhases';
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
import LazyPostPreview from './components/LazyPostPreview';
import LazyStatusChangeModal from './components/StatusChangeModal/LazyStatusChangeModal';
import Outlet from 'components/Outlet';

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

interface State {
  /** A set of ids of ideas/initiatives that are currently selected */
  selection: Set<string>;
  activeFilterMenu: TFilterMenu;
  searchTerm: string | undefined;
  previewPostId: string | null;
  previewMode: 'view' | 'edit';
}

export class PostManager extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      selection: new Set(),
      activeFilterMenu: props.defaultFilterMenu,
      searchTerm: undefined,
      previewPostId: null,
      previewMode: 'view',
    };
  }

  componentDidUpdate(prevProps: Props) {
    const { visibleFilterMenus } = this.props;

    if (
      prevProps.visibleFilterMenus !== visibleFilterMenus &&
      !visibleFilterMenus.find(
        (item) => item === this.state.activeFilterMenu
      ) &&
      visibleFilterMenus[0]
    ) {
      this.setState({ activeFilterMenu: visibleFilterMenus[0] });
    }
  }

  // Filtering handlers
  getSelectedProject = () => {
    const { posts, type } = this.props;
    if (type === 'Initiatives') return undefined;

    const { queryParameters } = posts as GetIdeasChildProps;
    return Array.isArray(queryParameters.projects) &&
      queryParameters.projects.length === 1
      ? queryParameters.projects[0]
      : undefined;
  };

  handleSearchChange = (event) => {
    const searchTerm = event.target.value;

    this.setState({ searchTerm });

    if (isFunction(this.props.posts.onChangeSearchTerm)) {
      this.props.posts.onChangeSearchTerm(searchTerm);
    }
  };

  onChangeProjects = (projectIds: string[] | undefined) => {
    const { projects, posts, type } = this.props;
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

  resetSelection = () => {
    this.setState({ selection: new Set() });
  };

  handleChangeSelection = (selection: Set<string>) => {
    this.setState({ selection });
  };
  // End selection management

  // Filter menu
  handleChangeActiveFilterMenu = (activeFilterMenu: TFilterMenu) => {
    this.setState({ activeFilterMenu });
  };
  // End Filter menu

  // Modal Preview
  openPreview = (postId: string) => {
    this.setState({ previewPostId: postId, previewMode: 'view' });
  };

  openPreviewEdit = () => {
    const { selection } = this.state;
    const previewPostId = [...selection][0];
    if (selection.size === 1 && previewPostId) {
      this.setState({ previewPostId, previewMode: 'edit' });
    }
  };

  switchPreviewMode = () => {
    if (this.state.previewMode === 'edit') {
      this.setState({ previewMode: 'view' });
    } else {
      this.setState({ previewMode: 'edit' });
    }
  };

  closePreview = () => {
    this.setState({ previewPostId: null });
  };
  // End Modal Preview

  getNonSharedParams = () => {
    const { type } = this.props;
    if (type === 'Initiatives') {
      const posts = this.props.posts as GetInitiativesChildProps;
      return {
        onChangePhase: undefined,
        selectedPhase: undefined,
        selectedStatus: posts.queryParameters.initiative_status,
      };
    } else if (type === 'AllIdeas' || type === 'ProjectIdeas') {
      const posts = this.props.posts as GetIdeasChildProps;
      return {
        onChangePhase: posts.onChangePhase,
        selectedPhase: posts.queryParameters.phase,
        selectedStatus: posts.queryParameters.idea_status,
      };
    }
    return {
      onChangePhase: () => {},
      selectedPhase: null,
      selectedStatus: null,
    };
  };

  render() {
    const {
      previewPostId,
      previewMode,
      searchTerm,
      selection,
      activeFilterMenu,
    } = this.state;
    const {
      type,
      projectId,
      projects,
      posts,
      phases,
      postStatuses,
      visibleFilterMenus,
      topics,
    } = this.props;
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

    const selectedProject = this.getSelectedProject();

    const { onChangePhase, selectedPhase, selectedStatus } =
      this.getNonSharedParams();

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
              project={selectedProject}
              phase={selectedPhase}
              topics={selectedTopics}
              status={selectedStatus}
              assignee={selectedAssignee}
              searchTerm={searchTerm}
            />
            <StyledExportMenu
              type={type}
              selection={selection}
              selectedProject={selectedProject}
            />
          </TopActionBar>

          <ThreeColumns>
            <LeftColumn>
              <ActionBar
                type={type}
                selection={selection}
                resetSelection={this.resetSelection}
                handleClickEdit={this.openPreviewEdit}
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
                  project={selectedProject}
                  phase={selectedPhase ?? undefined}
                  topics={selectedTopics ?? undefined}
                  ideaStatusId={selectedStatus ?? undefined}
                  search={searchTerm}
                  assignee={selectedAssignee ?? undefined}
                />
              ) : null}
              <StyledInput icon="search" onChange={this.handleSearchChange} />
            </MiddleColumnTop>
          </ThreeColumns>
          <ThreeColumns>
            <LeftColumn>
              <Sticky>
                <FilterSidebar
                  activeFilterMenu={activeFilterMenu}
                  visibleFilterMenus={visibleFilterMenus}
                  onChangeActiveFilterMenu={this.handleChangeActiveFilterMenu}
                  phases={!isNilOrError(phases) ? phases : undefined}
                  projects={!isNilOrError(projects) ? projects : undefined}
                  statuses={!isNilOrError(postStatuses) ? postStatuses : []}
                  topics={topics}
                  selectedPhase={selectedPhase}
                  selectedTopics={selectedTopics}
                  selectedStatus={selectedStatus}
                  selectedProject={selectedProject}
                  onChangePhaseFilter={onChangePhase}
                  onChangeTopicsFilter={onChangeTopics}
                  onChangeStatusFilter={onChangeStatus}
                  onChangeProjectFilter={this.onChangeProjects}
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
                onChangeSelection={this.handleChangeSelection}
                currentPageNumber={posts.currentPage}
                lastPageNumber={posts.lastPage}
                onChangePage={posts.onChangePage}
                handleSeeAll={onResetParams}
                openPreview={this.openPreview}
              />
            </MiddleColumn>
            <InfoSidebar
              postIds={[...selection]}
              openPreview={this.openPreview}
            />
          </ThreeColumns>
          <Suspense fallback={null}>
            <LazyPostPreview
              type={type}
              postId={previewPostId}
              mode={previewMode}
              onClose={this.closePreview}
              onSwitchPreviewMode={this.switchPreviewMode}
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
  }
}

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
