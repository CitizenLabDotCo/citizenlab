import React from 'react';
import { keys, isEmpty, size, isFunction, isArray } from 'lodash-es';
import { adopt } from 'react-adopt';
import styled from 'styled-components';
import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext } from 'react-dnd';
import { isNilOrError } from 'utils/helperUtils';

// services
import { globalState, IAdminFullWidth, IGlobalStateService } from 'services/globalState';
import { IProjectData } from 'services/projects';

// resources
import GetIdeaStatuses, { GetIdeaStatusesChildProps } from 'resources/GetIdeaStatuses';
import GetIdeas, { GetIdeasChildProps } from 'resources/GetIdeas';

// components
import ActionBar from './components/ActionBar';
import FilterSidebar from './components/FilterSidebar';
import IdeaTable from './components/IdeaTable';
import InfoSidebar from './components/InfoSidebar';
import ExportMenu, { exportType, Props as ExportMenuProps } from './components/ExportMenu';
import IdeasCount from './components/IdeasCount';
import { Input, Message } from 'semantic-ui-react';
import AssigneeFilter from './components/TopLevelFilters/AssigneeFilter';
import FeedbackToggle from './components/TopLevelFilters/FeedbackToggle';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
import { GetPhasesChildProps } from 'resources/GetPhases';
import PostPreview from './components/PostPreview';

const StyledExportMenu = styled(ExportMenu)<ExportMenuProps>`
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
  top: ${props => props.theme.menuHeight + 20}px;
`;

const StyledInput = styled(Input)`
  max-width: 260px;
  display: flex;
  width: 100%;
`;

type TIdeaManagerType =
  'AllIdeas' // should come with projectIds a list of projects that the current user can manage.
  | 'ProjectIdeas'; // should come with projectId
  // | 'Initiatives';

interface InputProps {
  // For all display and behaviour that's conditionned by the place this component is rendered
  // this prop is used for the test.
  type: TIdeaManagerType;

  // When the IdeaManager is used in admin/projects, we pass down the current projects id as a prop
  projectId?: string | null;

  // filters settings
  // the filters needed for this view, in the order they'll be shown, first one active by default
  visibleFilterMenus: TFilterMenu[]; // cannot be empty.
  phases?: GetPhasesChildProps;
  // When the IdeaManager is used in admin/posts, the parent component passes
  // down the array of projects the current user can moderate.
  projects?: IProjectData[] | null;
}

interface DataProps {
  posts: GetIdeasChildProps;
  postStatuses: GetIdeaStatusesChildProps;
}

interface Props extends InputProps, DataProps { }

type TFilterMenu = 'topics' | 'phases' | 'projects' | 'statuses';

interface State {
  selectedIdeas: { [key: string]: boolean };
  activeFilterMenu: TFilterMenu | null;
  searchTerm: string | undefined;
  previewPostId: string | null;
  previewMode: 'view' | 'edit';
}

class IdeaManager extends React.PureComponent<Props, State> {
  globalState: IGlobalStateService<IAdminFullWidth>;

  constructor(props: Props) {
    super(props);
    this.state = {
      selectedIdeas: {},
      activeFilterMenu: props.visibleFilterMenus[0],
      searchTerm: undefined,
      previewPostId: null,
      previewMode: 'view'
    };
    this.globalState = globalState.init('AdminFullWidth');
  }

  componentDidMount() {
    this.globalState.set({ enabled: true });
  }

  componentWillUnmount() {
    this.globalState.set({ enabled: false });
  }

  componentDidUpdate(prevProps: Props) {
    const { visibleFilterMenus } = this.props;

    if (prevProps.visibleFilterMenus !== visibleFilterMenus && !visibleFilterMenus.find(item => item === this.state.activeFilterMenu)) {
      this.setState({ activeFilterMenu: visibleFilterMenus[0] });
    }
  }

  handleSearchChange = (event) => {
    const searchTerm = event.target.value;

    this.setState({ searchTerm });

    if (isFunction(this.props.posts.onChangeSearchTerm)) {
      this.props.posts.onChangeSearchTerm(searchTerm);
    }
  }

  isAnyIdeaSelected = () => {
    return !isEmpty(this.state.selectedIdeas);
  }

  areMultipleIdeasSelected = () => {
    return size(this.state.selectedIdeas) > 1;
  }

  resetSelectedIdeas = () => {
    this.setState({ selectedIdeas: {} });
  }

  handleChangeIdeaSelection = (selectedIdeas: { [key: string]: boolean }) => {
    this.setState({ selectedIdeas });
  }

  handleChangeActiveFilterMenu = (activeFilterMenu: TFilterMenu) => {
    this.setState({ activeFilterMenu });
  }

  onChangeProjects = (projectIds: string[] | undefined) => {
    const { projects, posts, type } = this.props;
    const { onChangeProjects } = posts;

    if (type !== 'AllIdeas') return;

    const accessibleProjectsIds = projects ? projects.map(project => project.id) : null;

    if (!projectIds || projectIds.length === 0) {
      accessibleProjectsIds && onChangeProjects(accessibleProjectsIds);
    } else {
      onChangeProjects(projectIds);
    }
  }

  // Modal Preview
  openPreview = (postId: string) => {
    this.setState({ previewPostId: postId, previewMode: 'view' });
  }

  openPreviewEdit = () => {
    const selectedIdeaIds = keys(this.state.selectedIdeas);
    if (selectedIdeaIds.length === 1) {
      this.setState({ previewPostId: selectedIdeaIds[0], previewMode: 'edit' });
    }
  }

  switchPreviewMode = () => {
    if (this.state.previewMode === 'edit') {
      this.setState({ previewMode: 'view' });
    } else {
      this.setState({ previewMode: 'edit' });
    }
  }

  closePreview = () => {
    this.setState({ previewPostId: null });
  }
  // End Modal Preview

  render() {
    const { searchTerm, previewPostId, previewMode, selectedIdeas, activeFilterMenu } = this.state;
    const { type, projectId, projects, posts, phases, postStatuses, visibleFilterMenus } = this.props;
    const { list, onChangePhase, onChangeTopics, onChangeIdeaStatus, queryParameters, onChangeAssignee } = posts;
    const selectedTopics = queryParameters.topics;
    const selectedPhase = queryParameters.phase;
    const selectedAssignee = queryParameters.assignee;
    const selectedProject = isArray(queryParameters.projects) && queryParameters.projects.length === 1
      ? queryParameters.projects[0]
      : undefined;
    const selectedIdeaIds = keys(this.state.selectedIdeas);
    const showInfoSidebar = this.isAnyIdeaSelected();
    const multipleIdeasSelected = this.areMultipleIdeasSelected();

    const selectedStatus = queryParameters.idea_status;

    let exportQueryParameter;
    let exportType: null | exportType = null;
    if (selectedIdeaIds.length > 0) {
      exportQueryParameter = [...selectedIdeaIds];
      exportType = 'selected_ideas';
    } else if (selectedProject) {
      exportQueryParameter = selectedProject;
      exportType = 'project';
    } else {
      exportQueryParameter = 'all';
      exportType = 'all';
    }

    return (
      <>

        <TopActionBar>
          <AssigneeFilter
            assignee={selectedAssignee}
            projectId={type === 'ProjectIdeas' ? projectId : null}
            handleAssigneeFilterChange={onChangeAssignee}
          />
          <FeedbackToggle
            value={queryParameters.feedback_needed || false}
            onChange={posts.onChangeFeedbackFilter}
            project={selectedProject}
            phase={selectedPhase}
            topics={selectedTopics}
            status={selectedStatus}
            assignee={selectedAssignee}
            searchTerm={searchTerm}
          />
          <StyledExportMenu
            exportType={exportType}
            exportQueryParameter={exportQueryParameter}
          />
        </TopActionBar>

        <ThreeColumns>
          <LeftColumn>
            <ActionBar
              ideaIds={selectedIdeaIds}
              resetSelectedIdeas={this.resetSelectedIdeas}
              handleClickEdit={this.openPreviewEdit}
            />
          </LeftColumn>
          <MiddleColumnTop>
            <IdeasCount
              feedbackNeeded={queryParameters.feedback_needed || false}
              project={selectedProject}
              phase={selectedPhase}
              topics={selectedTopics}
              ideaStatus={selectedStatus}
              searchTerm={searchTerm}
              assignee={selectedAssignee}
            />
            <StyledInput icon="search" onChange={this.handleSearchChange}/>
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
                selectedTopics={selectedTopics}
                selectedPhase={selectedPhase}
                selectedProject={selectedProject}
                selectedStatus={selectedStatus}
                onChangePhaseFilter={onChangePhase}
                onChangeTopicsFilter={onChangeTopics}
                onChangeProjectFilter={this.onChangeProjects}
                onChangeStatusFilter={onChangeIdeaStatus}
              />
              {multipleIdeasSelected &&
                <Message
                  info={true}
                  attached="bottom"
                  icon="info"
                  content={<FormattedMessage {...messages.multiDragAndDropHelp} />}
                />
              }
            </Sticky>
          </LeftColumn>
          <MiddleColumn>
            <IdeaTable
              activeFilterMenu={activeFilterMenu}
              sortAttribute={posts.sortAttribute}
              sortDirection={posts.sortDirection}
              onChangeSort={posts.onChangeSorting}
              posts={list || undefined}
              phases={phases || undefined}
              statuses={postStatuses || undefined}
              selectedIdeas={selectedIdeas}
              onChangeIdeaSelection={this.handleChangeIdeaSelection}
              currentPageNumber={posts.currentPage}
              lastPageNumber={posts.lastPage}
              onChangePage={posts.onChangePage}
              handleSeeAll={this.props.posts.onResetParams}
              openPreview={this.openPreview}
            />
          </MiddleColumn>
          <InfoSidebar
            postIds={selectedIdeaIds}
            showInfoSidebar={showInfoSidebar}
            openPreview={this.openPreview}
          />
        </ThreeColumns>
        <PostPreview
          postId={previewPostId}
          mode={previewMode}
          onClose={this.closePreview}
          onSwitchPreviewMode={this.switchPreviewMode}
        />
      </>
    );
  }
}

const Data = adopt<DataProps, InputProps>({
  posts: ({ type, projectId, projects, render }) => (
    <GetIdeas
      type="paginated"
      pageSize={10}
      sort="new"
      projectIds={type === 'ProjectIdeas' && projectId
        ? [projectId]
        : type === 'AllIdeas' && projects
        ? projects.map(project => project.id)
        : undefined
      }
    >
      {render}
    </GetIdeas>
  ),
  postStatuses: <GetIdeaStatuses />,
});

const IdeaManagerWithDragDropContext = DragDropContext(HTML5Backend)(IdeaManager);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <IdeaManagerWithDragDropContext {...inputProps} {...dataProps} />}
  </Data>
);
