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
import GetProjects, { GetProjectsChildProps } from 'resources/GetProjects';
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
import ExportMenu from './components/ExportMenu';
import { Input, Message } from 'semantic-ui-react';
import { SectionTitle, SectionSubtitle } from 'components/admin/Section';
import AssigneeFilter from './components/TopLevelFilters/AssigneeFilter';
import FeedbackToggle from './components/TopLevelFilters/FeedbackToggle';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

const StyledDiv = styled.div`
  margin-bottom: 30px;
`;

const StyledExportMenu = styled(ExportMenu)`
  margin-left: auto;
`;

const TopActionBar = styled.div`
  display: flex;
  margin-bottom: 20px;
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
  max-width: 260px;
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
  width: 100%;
`;

interface InputProps {
  project?: IProjectData | null;
}

interface DataProps {
  projects: GetProjectsChildProps;
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
  assignee: string;
  feedbackNeededFilterActive: boolean;
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
      assignee: !isNilOrError(props.authUser) ? props.authUser.id : '',
      feedbackNeededFilterActive: false
    };
    this.globalState = globalState.init('AdminFullWidth');
  }

  componentDidMount() {
    this.globalState.set({ enabled: true });

    if (this.props.project && isFunction(this.props.ideas.onChangeProjects)) {
      this.props.ideas.onChangeProjects([this.props.project.id]);
    }

    this.setVisibleFilterMenus(this.props.project);
  }

  componentWillUnmount() {
    this.globalState.set({ enabled: false });
  }

  componentDidUpdate(prevProps: Props) {
    const oldProjectId = get(prevProps.project, 'id', null);
    const newProjectId = get(this.props.project, 'id', null);

    if (this.props.project && newProjectId !== oldProjectId) {
      if (isFunction(this.props.ideas.onChangeProjects)) {
        this.props.ideas.onChangeProjects([this.props.project.id]);
      }

      this.setVisibleFilterMenus(this.props.project);
    }

    const { authUser } = this.props;
    const prevAuthUser = prevProps.authUser;
    if (isNilOrError(prevAuthUser) && !isNilOrError(authUser) && !this.state.assignee) {
      this.props.ideas.onChangeAssignee(authUser.id);
      this.setState({ assignee: authUser.id });
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
    const term = event.target.value;

    if (isFunction(this.props.ideas.onChangeSearchTerm)) {
      this.props.ideas.onChangeSearchTerm(term);
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

  handleAssigneeFilterChange = (assignee: string) => {
    const { authUser, tenant } = this.props;
    const adminAtWorkId = authUser && authUser.id;
    const tenantId = !isNilOrError(tenant) && tenant.id;
    this.props.ideas.onChangeAssignee(assignee === 'all' ? undefined : assignee);
    this.setState({ assignee });

    // analytics
    trackEventByName(tracks.assigneeFilterUsed, {
      assignee,
      tenant: tenantId,
      adminAtWork: adminAtWorkId
    });
  }

  handleToggleFeedbackNeededFilter = () => {
    const { feedbackNeededFilterActive } = this.state;

    // If toggle turned ON, unselect all ideas
    // feedbackNeededFilterActive should be false at this stage and will be changed to true later in this function
    !feedbackNeededFilterActive && this.handleChangeIdeaSelection({});
    // If toggle turned ON, unselect all ideas, reset all filters from the sidebar
    this.props.ideas.onChangeFeedbackFilter(!feedbackNeededFilterActive ? true : undefined);

    this.setState({ feedbackNeededFilterActive: !feedbackNeededFilterActive });
  }

  handleSeeAllIdeas = () => {
    this.setState({ feedbackNeededFilterActive: false, assignee: 'all' });
    this.props.ideas.onResetAllParams();
  }

  render() {
    const { project, projects, ideas, phases, ideaStatuses, topics } = this.props;
    const { projectsList } = projects;
    const { ideasList, onChangePhase, onChangeTopics, onChangeProjects, onChangeIdeaStatus } = ideas;
    const selectedTopics = ideas.queryParameters.topics;
    const selectedPhase = ideas.queryParameters.phase;
    const selectedProject = isArray(ideas.queryParameters.projects) ? ideas.queryParameters.projects[0] : undefined;
    const selectedIdeaStatus = ideas.queryParameters.idea_status;
    const { selectedIdeas, activeFilterMenu, visibleFilterMenus, assignee, feedbackNeededFilterActive } = this.state;
    const selectedIdeaIds = keys(this.state.selectedIdeas);
    const showInfoSidebar = this.isAnyIdeaSelected();
    const multipleIdeasSelected = this.areMultipleIdeasSelected();

    let exportQueryParameter;
    let exportType: null | string = null;
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
        {project !== undefined &&
          <StyledDiv>
            <SectionTitle>
              <FormattedMessage {...messages.titleIdeas} />
            </SectionTitle>
            <SectionSubtitle>
              <FormattedMessage {...messages.subtitleIdeas} />
            </SectionSubtitle>
          </StyledDiv>
        }

        <TopActionBar>
          <AssigneeFilter
            projectId={!isNilOrError(project) ? project.id : undefined}
            assignee={assignee}
            handleAssigneeFilterChange={this.handleAssigneeFilterChange}
          />
          <FeedbackToggle
            value={feedbackNeededFilterActive}
            onChange={this.handleToggleFeedbackNeededFilter}
            assignee={assignee}
          />
          <StyledExportMenu
            exportType={exportType}
            exportQueryParameter={exportQueryParameter}
          />
        </TopActionBar>

        <ThreeColumns>
          <MiddleColumn>
            <ActionBar
              ideaIds={selectedIdeaIds}
              resetSelectedIdeas={this.resetSelectedIdeas}
            />
          </MiddleColumn>
          <RightColumn>
            <StyledInput icon="search" onChange={this.handleSearchChange}/>
          </RightColumn>
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
                projects={!isNilOrError(projectsList) ? projectsList : undefined}
                statuses={!isNilOrError(ideaStatuses) ? ideaStatuses : []}
                selectedTopics={selectedTopics}
                selectedPhase={selectedPhase}
                selectedProject={selectedProject}
                selectedStatus={selectedIdeaStatus}
                onChangePhaseFilter={onChangePhase}
                onChangeTopicsFilter={onChangeTopics}
                onChangeProjectFilter={onChangeProjects}
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
              handleSeeAllIdeas={this.handleSeeAllIdeas}
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
  projects: <GetProjects pageSize={250} sort="new" publicationStatuses={['draft', 'published', 'archived']} />,
  ideas: <GetIdeas type="paginated" pageSize={10} sort="new" />,
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
