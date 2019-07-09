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
import IdeaPreview from './components/IdeaPreview';

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
  // When the IdeaManager is used in admin/ideas, the parent component passes
  // down the array of projects the current user can moderate.
  projects?: IProjectData[] | null;
}

interface DataProps {
  ideas: GetIdeasChildProps;
  ideaStatuses: GetIdeaStatusesChildProps;
}

interface Props extends InputProps, DataProps { }

type TFilterMenu = 'topics' | 'phases' | 'projects' | 'statuses';

interface State {
  selectedIdeas: { [key: string]: boolean };
  activeFilterMenu: TFilterMenu | null;
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
      activeFilterMenu: props.visibleFilterMenus[0],
      searchTerm: undefined,
      modalIdeaId: null,
      ideaModalMode: 'view'
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
    const { projects, ideas, type } = this.props;
    const { onChangeProjects } = ideas;

    if (type !== 'AllIdeas') return;

    const accessibleProjectsIds = projects ? projects.map(project => project.id) : null;

    if (!projectIds || projectIds.length === 0) {
      accessibleProjectsIds && onChangeProjects(accessibleProjectsIds);
    } else {
      onChangeProjects(projectIds);
    }
  }

  // Preview
  openPreview = (ideaId: string) => {
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
    const { searchTerm, modalIdeaId, ideaModalMode, selectedIdeas, activeFilterMenu } = this.state;
    const { type, projectId, projects, ideas, phases, ideaStatuses, visibleFilterMenus } = this.props;
    const { ideasList, onChangePhase, onChangeTopics, onChangeIdeaStatus, queryParameters, onChangeAssignee } = ideas;
    const selectedTopics = queryParameters.topics;
    const selectedPhase = queryParameters.phase;
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
            assignee={queryParameters.assignee}
            projectId={type === 'ProjectIdeas' ? projectId : null}
            handleAssigneeFilterChange={onChangeAssignee}
          />
          <FeedbackToggle
            value={queryParameters.feedback_needed || false}
            onChange={ideas.onChangeFeedbackFilter}
            project={selectedProject}
            phase={selectedPhase}
            topics={selectedTopics}
            ideaStatus={selectedStatus}
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
              ideaStatus={selectedStatus}
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
                phases={!isNilOrError(phases) ? phases : undefined}
                projects={!isNilOrError(projects) ? projects : undefined}
                statuses={!isNilOrError(ideaStatuses) ? ideaStatuses : []}
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
              onClickIdeaTitle={this.openPreview}
            />
          </MiddleColumn>
          <InfoSidebar
            ideaIds={selectedIdeaIds}
            showInfoSidebar={showInfoSidebar}
            openPreview={this.openPreview}
          />
        </ThreeColumns>
        <IdeaPreview
          ideaId={modalIdeaId}
          mode={ideaModalMode}
          onCloseModal={this.closeSideModal}
          onSwitchIdeaMode={this.switchModalMode}
        />
      </>
    );
  }
}

const Data = adopt<DataProps, InputProps>({
  ideas: ({ type, projectId, projects, render }) => (
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
  ideaStatuses: <GetIdeaStatuses />,
});

const IdeaManagerWithDragDropContext = DragDropContext(HTML5Backend)(IdeaManager);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <IdeaManagerWithDragDropContext {...inputProps} {...dataProps} />}
  </Data>
);
