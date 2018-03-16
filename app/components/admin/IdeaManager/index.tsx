import * as React from 'react';
import { keys, isEmpty, flow, size, get } from 'lodash';
import styled from 'styled-components';
import { globalState, IAdminFullWidth, IGlobalStateService } from 'services/globalState';

import { FormattedMessage } from 'utils/cl-intl';
import { topicsStream, ITopicData } from 'services/topics';
import { ideaStatusesStream, IIdeaStatusData } from 'services/ideaStatuses';
import { projectsStream, IProjectData } from 'services/projects';
import { phasesStream, IPhaseData } from 'services/phases';
import { injectIdeasLoader, InjectedIdeaLoaderProps } from 'utils/resourceLoaders/ideasLoader';
import { InjectedResourcesLoaderProps, injectResources } from 'utils/resourceLoaders/resourcesLoader';
import { InjectedNestedResourceLoaderProps, injectNestedResources } from 'utils/resourceLoaders/nestedResourcesLoader';

import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext } from 'react-dnd';
import CSSTransition from 'react-transition-group/CSSTransition';

// Components
import FilterSidebar from './components/FilterSidebar';
import InfoSidebar from './components/InfoSidebar';
import IdeaTable from './components/IdeaTable';
import { Input, Sticky, Message } from 'semantic-ui-react';

import messages from './messages';

type Props = InjectedIdeaLoaderProps & InjectedResourcesLoaderProps<IProjectData> & InjectedResourcesLoaderProps<ITopicData> & InjectedResourcesLoaderProps<IIdeaStatusData> & InjectedNestedResourceLoaderProps<IPhaseData> & {
  project?: IProjectData | null;
};

type TFilterMenu = 'topics' | 'phases' | 'projects' | 'statuses';

type State = {
  selectedIdeas: {[key: string]: boolean},
  activeFilterMenu: TFilterMenu | null,
  visibleFilterMenus: string[];
  contextRef: any;
};

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

const MiddleColumn = styled.div`
  flex: 1;
  transition: 200ms;
`;

const RightColumn = styled.div`
  width: 260px;

  &.slide-enter {
    transform: translateX(100%);
    opacity: 0.01;

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
      opacity: 0.01;
    }
  }
`;

class IdeaManager extends React.PureComponent<Props, State> {
  globalState: IGlobalStateService<IAdminFullWidth>;

  constructor(props) {
    super(props);

    this.state = {
      selectedIdeas: {},
      visibleFilterMenus: [],
      activeFilterMenu: null,
      contextRef: null,
    };

    this.globalState = globalState.init('AdminFullWidth');
  }

  componentDidMount() {
    this.globalState.set({ enabled: true });

    if (this.props.project) {
      this.props.onChangeProjectFilter && this.props.onChangeProjectFilter(this.props.project.id);
    }

    this.setVisibleFilterMenus(this.props.project);
  }

  componentWillUnmount() {
    this.globalState.set({ enabled: false });
  }

  componentDidUpdate(prevProps: Props) {
    const oldProjectId = get(prevProps, 'project.id', null);
    const newProjectId = get(this.props, 'project.id', null);

    if (this.props.project && newProjectId !== oldProjectId) {
      this.props.onChangeProjectFilter && this.props.onChangeProjectFilter(this.props.project.id);
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
    const term = event.target.value;
    this.props.onChangeSearchTerm && this.props.onChangeSearchTerm(term);
  }

  isAnyIdeaSelected = () => {
    return !isEmpty(this.state.selectedIdeas);
  }

  areMultipleIdeasSelected = () => {
    return size(this.state.selectedIdeas) > 1;
  }

  handleChangeIdeaSelection = (selectedIdeas) => {
    this.setState({ selectedIdeas });
  }

  handleChangeActiveFilterMenu = (activeFilterMenu) => {
    this.setState({ activeFilterMenu });
  }

  handleContextRef = (contextRef) => this.setState({ contextRef });

  render() {
    const { ideaSortAttribute, ideaSortDirection, ideaCurrentPageNumber, ideaLastPageNumber, ideas, phases, ideaStatuses } = this.props;
    const { selectedIdeas, activeFilterMenu, visibleFilterMenus } = this.state;
    const selectedIdeaIds = keys(this.state.selectedIdeas);
    const showInfoSidebar = this.isAnyIdeaSelected();
    const multipleIdeasSelected = this.areMultipleIdeasSelected();

    return (
      <div ref={this.handleContextRef}>
        <ThreeColumns>
          <LeftColumn>
            <Input icon="search" onChange={this.handleSearchChange} />
          </LeftColumn>
        </ThreeColumns>
        <ThreeColumns>
          <LeftColumn>
            <Sticky context={this.state.contextRef} offset={100}>
              <FilterSidebar
                activeFilterMenu={activeFilterMenu}
                visibleFilterMenus={visibleFilterMenus}
                onChangeActiveFilterMenu={this.handleChangeActiveFilterMenu}
                project={(this.props.project && this.props.project) || null}
                phases={this.props.phases.all}
                topics={this.props.topics.all}
                projects={this.props.projects.all}
                statuses={this.props.ideaStatuses.all}
                selectedTopics={this.props.ideaTopicsFilter}
                selectedPhase={this.props.ideaPhaseFilter}
                selectedProject={this.props.ideaProjectFilter}
                selectedStatus={this.props.ideaStatusFilter}
                onChangePhaseFilter={this.props.onChangePhaseFilter}
                onChangeTopicsFilter={this.props.onChangeTopicsFilter}
                onChangeProjectFilter={this.props.onChangeProjectFilter}
                onChangeStatusFilter={this.props.onChangeStatusFilter}
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
              ideaSortAttribute={ideaSortAttribute}
              ideaSortDirection={ideaSortDirection}
              onChangeIdeaSortDirection={this.props.onChangeIdeaSortDirection}
              onChangeIdeaSortAttribute={this.props.onChangeIdeaSortAttribute}
              ideas={ideas}
              phases={phases.all}
              statuses={ideaStatuses.all}
              selectedIdeas={selectedIdeas}
              onChangeIdeaSelection={this.handleChangeIdeaSelection}
              ideaCurrentPageNumber={ideaCurrentPageNumber}
              ideaLastPageNumber={ideaLastPageNumber}
              onIdeaChangePage={this.props.onIdeaChangePage}
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
              <Sticky context={this.state.contextRef} offset={100}>
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

export default flow(
  injectResources('projects', projectsStream),
  injectResources('topics', topicsStream),
  injectResources('ideaStatuses', ideaStatusesStream),
  injectNestedResources('phases', phasesStream, (props) => props.project && props.project.id),
  injectIdeasLoader,
  DragDropContext(HTML5Backend)
)(IdeaManager);

