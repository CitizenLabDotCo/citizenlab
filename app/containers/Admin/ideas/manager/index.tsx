import * as React from 'react';
import * as Rx from 'rxjs';
import { keys, isEmpty, filter, flow } from 'lodash';
import styled from 'styled-components';

import { FormattedMessage } from 'utils/cl-intl';
import { updateIdea, deleteIdea } from 'services/ideas';
import { topicsStream, ITopicData } from 'services/topics';
import { ideaStatusesStream, IIdeaStatusData } from 'services/ideaStatuses';
import { projectsStream, IProjectData } from 'services/projects';
import { phasesStream, IPhaseData } from 'services/phases';
import { injectTFunc } from 'components/T/utils';
import { injectIdeasLoader, InjectedIdeaLoaderProps } from './ideasLoader';
import { InjectedResourcesLoaderProps, injectResources } from './resourcesLoader';
import { InjectedNestedResourceLoaderProps, injectNestedResources } from './nestedResourcesLoader';

import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext } from 'react-dnd';

// Components
import Button from 'components/UI/Button';
import FilterSidebar from './components/FilterSidebar';
import InfoSidebar from './components/InfoSidebar';
import IdeaTable from './components/IdeaTable';
import { Input, Menu, Dropdown, Grid, Search } from 'semantic-ui-react';

import messages from './messages';

type Props = InjectedIdeaLoaderProps & InjectedResourcesLoaderProps<IProjectData> & InjectedResourcesLoaderProps<ITopicData> & InjectedResourcesLoaderProps<IIdeaStatusData> & InjectedNestedResourceLoaderProps<IPhaseData> & {
  tFunc: ({}) => string;
  project?: IProjectData | null;
};

type TFilterMenu = 'topics' | 'phases';

type State = {
  selectedIdeas: {[key: string]: boolean},
  activeFilterMenu: TFilterMenu | null,
  visibleFilterMenus: string[];
};

class IdeaManager extends React.PureComponent<Props, State> {

  constructor(props) {
    super(props);

    this.state = {
      selectedIdeas: {},
      visibleFilterMenus: [],
      activeFilterMenu: null,
    };
  }

  componentDidMount() {
    if (this.props.project) {
      this.props.onChangeProjectFilter && this.props.onChangeProjectFilter(this.props.project.id);
    }
    this.setVisibleFilterMenus(!!this.props.project);
  }

  componentWillReceiveProps(nextProps) {
    if ((this.props.project && this.props.project.id) !== (nextProps.project && nextProps.project.id)) {
      this.props.onChangeProjectFilter && this.props.onChangeProjectFilter(nextProps.project && nextProps.project.id);
      this.setVisibleFilterMenus(!!nextProps.project);
    }
  }

  setVisibleFilterMenus = (inProject: boolean) => {
    const visibleFilterMenus: TFilterMenu[] = inProject ? ['phases', 'topics'] : ['topics'];
    this.setState({
      visibleFilterMenus,
      activeFilterMenu: visibleFilterMenus[0],
    });
  }

  handleSearchChange = (event) => {
    const term = event.target.value;
    this.props.onChangeSearchTerm && this.props.onChangeSearchTerm(term);
  }

  handleIdeaStatusChange = (idea, statusId) => () => {
    updateIdea(
      idea.id,
      { idea_status_id: statusId },
    );
  }

  handleDeleteIdea = (idea) => () => {
    deleteIdea(idea.id);
  }

  isAnyIdeaSelected = () => {
    return !isEmpty(this.state.selectedIdeas);
  }

  ideaSelectionToIdeas = () => {
    return filter(this.props.ideas, (i) => this.state.selectedIdeas[i.id]);
  }

  handleChangeIdeaSelection = (selectedIdeas) => {
    this.setState({ selectedIdeas });
  }

  handleChangeActiveFilterMenu = (activeFilterMenu) => {
    this.setState({ activeFilterMenu });
  }

  render() {
    const { ideaSortAttribute, ideaSortDirection, ideaCurrentPageNumber, ideaLastPageNumber, ideas, phases } = this.props;
    const { selectedIdeas, activeFilterMenu, visibleFilterMenus } = this.state;
    const selectedIdeaIds = keys(this.state.selectedIdeas);
    const showInfoSidebar = this.isAnyIdeaSelected();

    return (
      <div>
        <Grid columns={3}>
          <Grid.Row>
            <Grid.Column width={16}>
              <Input icon="search" onChange={this.handleSearchChange} />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={4}>
              <FilterSidebar
                activeFilterMenu={activeFilterMenu}
                visibleFilterMenus={visibleFilterMenus}
                onChangeActiveFilterMenu={this.handleChangeActiveFilterMenu}
                project={this.props.project || null}
                phases={this.props.phases.all}
                topics={this.props.topics.all}
                selectedTopics={this.props.ideaTopicsFilter}
                selectedPhase={this.props.ideaPhaseFilter}
                onChangePhaseFilter={this.props.onChangePhaseFilter}
                onChangeTopicsFilter={this.props.onChangeTopicsFilter}
              />
            </Grid.Column>
            <Grid.Column width={showInfoSidebar ? 8 : 12}>
              <IdeaTable
                activeFilterMenu={activeFilterMenu}
                ideaSortAttribute={ideaSortAttribute}
                ideaSortDirection={ideaSortDirection}
                onChangeIdeaSortDirection={this.props.onChangeIdeaSortDirection}
                onChangeIdeaSortAttribute={this.props.onChangeIdeaSortAttribute}
                ideas={ideas}
                phases={phases.all}
                selectedIdeas={selectedIdeas}
                onChangeIdeaSelection={this.handleChangeIdeaSelection}
                ideaCurrentPageNumber={ideaCurrentPageNumber}
                ideaLastPageNumber={ideaLastPageNumber}
                onIdeaChangePage={this.props.onIdeaChangePage}
              />
            </Grid.Column>
            {showInfoSidebar && <Grid.Column width={4}>
                <InfoSidebar
                  ideaIds={selectedIdeaIds}
                />
              </Grid.Column>}
          </Grid.Row>
        </Grid>
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
  DragDropContext(HTML5Backend),
  injectTFunc
)(IdeaManager);

