import React from 'react';
import { keys, isEmpty, size, get, isFunction, isArray } from 'lodash-es';
import { adopt } from 'react-adopt';
import styled from 'styled-components';
import { media } from 'utils/styleUtils';
import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext } from 'react-dnd';
import CSSTransition from 'react-transition-group/CSSTransition';
import { isNilOrError } from 'utils/helperUtils';

// services
import { globalState, IAdminFullWidth, IGlobalStateService } from 'services/globalState';
import { IProjectData } from 'services/projects';

// resources
import GetTopics, { GetTopicsChildProps } from 'resources/GetTopics';
import GetIdeaStatuses, { GetIdeaStatusesChildProps } from 'resources/GetIdeaStatuses';
import GetPhases, { GetPhasesChildProps } from 'resources/GetPhases';
import GetIdeas, { GetIdeasChildProps } from 'resources/GetIdeas';
import GetIdeasCount from 'resources/GetIdeasCount';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';

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

const Sticky = styled.div`
  position: -webkit-sticky;
  position: sticky;
  top: ${props => props.theme.menuHeight + 20}px;
`;

const MiddleColumn = styled.div`
  flex: 1;
  transition: 200ms;
`;

const RightColumn = styled.div`
  max-width: 200px;
  display: flex;

  ${media.smallerThan1280px`
    display: none;
  `}

  &.slide-enter {
    transform: translateX(100%);
    opacity: 0;

    &.slide-enter-active {
      transition: 200ms;
      transform: translateX(0%);
      opacity: 1;
    }
  }

  &.slide-exit {
    transition: 200ms;
    transform: translateX(0%);
    opacity: 1;

    &.slide-exit-active {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;

const StyledInput = styled(Input)`
  max-width: 260px;
  display: flex;
  width: 100%;
`;

interface InputProps {
  // When the IdeaManager is used in admin/projects, we pass down the current project as a prop
  project?: IProjectData | null;

  // When the IdeaManager is used in admin/ideas, the parent component passes
  // down the array of projects the current user can moderate.
  projects?: IProjectData[] | null;
}

interface DataProps {
  ideas: GetIdeasChildProps;
  topics: GetTopicsChildProps;
  ideaStatuses: GetIdeaStatusesChildProps;
  phases: GetPhasesChildProps;
  authUser: GetAuthUserChildProps;
  tenant: GetTenantChildProps;
}

interface Props extends InputProps, DataProps { }

type TFilterMenu = 'topics' | 'phases' | 'projects' | 'statuses';

interface State {
  selectedIdeas: { [key: string]: boolean };
  activeFilterMenu: TFilterMenu | null;
  visibleFilterMenus: string[];
  contextRef: any;
  searchTerm: string | undefined;
  modalIdeaId: string | null;
  ideaModalMode: 'view' | 'edit';
}

class IdeaManager extends React.PureComponent<Props, State> {
  globalState: IGlobalStateService<IAdminFullWidth>;

  constructor(props: Props) {
    super(props);
    this.state = {
      selectedIdeas: {},
      visibleFilterMenus: [],
      activeFilterMenu: null,
      contextRef: null,
      searchTerm: undefined,
      modalIdeaId: null,
      ideaModalMode: 'view'
    };
    this.globalState = globalState.init('AdminFullWidth');
  }

  componentDidMount() {
    this.globalState.set({ enabled: true });

    this.setVisibleFilterMenus(this.props.project);
  }

  componentWillUnmount() {
    this.globalState.set({ enabled: false });
  }

  componentDidUpdate(prevProps: Props) {
    const oldProjectId = get(prevProps.project, 'id', null);
    const newProjectId = get(this.props.project, 'id', null);

    if (this.props.project && newProjectId !== oldProjectId) {
      this.setVisibleFilterMenus(this.props.project);
    }
  }

  setVisibleFilterMenus = (project?: IProjectData | null) => {
    let visibleFilterMenus: TFilterMenu[] = [];

    if (project && project.attributes.process_type === 'timeline') {
      visibleFilterMenus = ['phases', 'statuses', 'topics'];
    } else if (project) {
      visibleFilterMenus = ['statuses', 'topics'];
    } else {
      visibleFilterMenus = ['projects', 'topics', 'statuses'];
    }

    this.setState({
      visibleFilterMenus,
      activeFilterMenu: visibleFilterMenus[0],
    });
  }

  handleSearchChange = (event) => {
    const searchTerm = event.target.value;

    this.setState({ searchTerm });

    if (isFunction(this.props.ideas.onChangeSearchTerm)) {
      this.props.ideas.onChangeSearchTerm(searchTerm);
    }

  }

  isAnyIdeaSelected = () => {
    return !isEmpty(this.state.selectedIdeas);
  }

  areMultipleIdeasSelected = () => {
    return size(this.state.selectedIdeas) > 1;
  }

  handleChangeIdeaSelection = (selectedIdeas: { [key: string]: boolean }) => {
    this.setState({ selectedIdeas });
  }

  handleChangeActiveFilterMenu = (activeFilterMenu: TFilterMenu) => {
    this.setState({ activeFilterMenu });
  }

  handleContextRef = (contextRef) => {
    this.setState({ contextRef });
  }

  resetSelectedIdeas = () => {
    this.setState({ selectedIdeas: {} });
  }

  onChangeProjects = (projectIds: string[] | undefined) => {
    const { project, projects, ideas } = this.props;
    const { onChangeProjects } = ideas;

    const accessibleProjectsIds = !isNilOrError(project) ? [project.id] : (projects ? projects.map(project => project.id) : null);

    if (!projectIds || projectIds.length === 0) {
      accessibleProjectsIds && onChangeProjects(accessibleProjectsIds);
    } else {
      onChangeProjects(projectIds);
    }
  }

  openIdeaPreview = (ideaId: string) => {
    this.setState({ modalIdeaId: ideaId, ideaModalMode: 'view' });
  }

  openIdeaEdit = () => {
    const selectedIdeaIds = keys(this.state.selectedIdeas);
    if (selectedIdeaIds.length === 1) {
      this.setState({ modalIdeaId: selectedIdeaIds[0], ideaModalMode: 'edit' });
    }
  }

  switchModalMode = () => {
    if (this.state.ideaModalMode === 'edit') {
      this.setState({ ideaModalMode: 'view' });
    } else {
      this.setState({ ideaModalMode: 'edit' });
    }
  }

  closeSideModal = () => {
    this.setState({ modalIdeaId: null });
  }

  render() {
    const { searchTerm, modalIdeaId, ideaModalMode } = this.state;
    const { project, projects, ideas, phases, ideaStatuses, topics } = this.props;
    const { ideasList, onChangePhase, onChangeTopics, onChangeIdeaStatus, queryParameters } = ideas;
    const selectedTopics = queryParameters.topics;
    const selectedPhase = queryParameters.phase;
    const selectedProject = isArray(queryParameters.projects) && queryParameters.projects.length === 1 ? queryParameters.projects[0] : undefined;
    const selectedIdeaStatus = queryParameters.idea_status;
    const { selectedIdeas, activeFilterMenu, visibleFilterMenus } = this.state;
    const selectedIdeaIds = keys(this.state.selectedIdeas);
    const showInfoSidebar = this.isAnyIdeaSelected();
    const multipleIdeasSelected = this.areMultipleIdeasSelected();

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
      <div ref={this.handleContextRef}>

        <TopActionBar>
          <AssigneeFilter
            assignee={queryParameters.assignee}
            projectId={!isNilOrError(project) ? project.id : undefined}
            handleAssigneeFilterChange={ideas.onChangeAssignee}
          />
          <FeedbackToggle
            value={queryParameters.feedback_needed || false}
            onChange={ideas.onChangeFeedbackFilter}
            project={selectedProject}
            phase={selectedPhase}
            topics={selectedTopics}
            ideaStatus={selectedIdeaStatus}
            assignee={queryParameters.assignee}
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
              handleClickEdit={this.openIdeaEdit}
            />
          </LeftColumn>
          <MiddleColumnTop>
            <IdeasCount
              feedbackNeeded={queryParameters.feedback_needed || false}
              project={selectedProject}
              phase={selectedPhase}
              topics={selectedTopics}
              ideaStatus={selectedIdeaStatus}
              searchTerm={searchTerm}
              assignee={queryParameters.assignee}
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
                project={!isNilOrError(project) ? project : undefined}
                phases={!isNilOrError(phases) ? phases : undefined}
                topics={!isNilOrError(topics) ? topics : undefined}
                projects={!isNilOrError(projects) ? projects : undefined}
                statuses={!isNilOrError(ideaStatuses) ? ideaStatuses : []}
                selectedTopics={selectedTopics}
                selectedPhase={selectedPhase}
                selectedProject={selectedProject}
                selectedStatus={selectedIdeaStatus}
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
              ideaSortAttribute={ideas.sortAttribute}
              ideaSortDirection={ideas.sortDirection}
              onChangeIdeaSort={ideas.onChangeSorting}
              ideas={ideasList || undefined}
              phases={phases || undefined}
              statuses={ideaStatuses || undefined}
              selectedIdeas={selectedIdeas}
              onChangeIdeaSelection={this.handleChangeIdeaSelection}
              ideaCurrentPageNumber={ideas.currentPage}
              ideaLastPageNumber={ideas.lastPage}
              onIdeaChangePage={ideas.onChangePage}
              handleSeeAllIdeas={this.props.ideas.onResetParams}
              switchModalMode={this.switchModalMode}
              onCloseModal={this.closeSideModal}
              onClickIdeaTitle={this.openIdeaPreview}
              modalIdeaId={modalIdeaId}
              ideaModalMode={ideaModalMode}
            />
          </MiddleColumn>
          <CSSTransition
            in={showInfoSidebar}
            mountOnEnter={true}
            unmountOnExit={true}
            timeout={200}
            classNames="slide"
          >
            <RightColumn>
              <Sticky>
                <InfoSidebar
                  ideaIds={selectedIdeaIds}
                />
              </Sticky>
            </RightColumn>
          </CSSTransition>
        </ThreeColumns>
      </div>
    );
  }
}

const Data = adopt<DataProps, InputProps>({
  ideas: ({ project, projects, render }) => <GetIdeas type="paginated" pageSize={10} sort="new" projectIds={project ? [project.id] : (projects ? projects.map(project => project.id) : undefined)}>{render}</GetIdeas>,
  topics: <GetTopics />,
  tenant: <GetTenant />,
  ideaStatuses: <GetIdeaStatuses />,
  authUser: <GetAuthUser />,
  phases: ({ project, render }) => <GetPhases projectId={get(project, 'id')}>{render}</GetPhases>,
  ideasCount:  <GetIdeasCount feedbackNeeded={true} />
});

const IdeaManagerWithDragDropContext = DragDropContext(HTML5Backend)(IdeaManager);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <IdeaManagerWithDragDropContext {...inputProps} {...dataProps} />}
  </Data>
);
