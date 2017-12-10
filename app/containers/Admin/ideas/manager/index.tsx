import * as React from 'react';
import * as Rx from 'rxjs';
import * as _ from 'lodash';
import styled from 'styled-components';

import { FormattedMessage } from 'utils/cl-intl';
import Pagination from 'components/admin/Pagination';
import SortableTableHeader from 'components/admin/SortableTableHeader';
import { updateIdea, deleteIdea } from 'services/ideas';
import { topicsStream, ITopicData } from 'services/topics';
import { ideaStatusesStream, IIdeaStatusData } from 'services/ideaStatuses';
import { projectsStream, IProjectData } from 'services/projects';
import { phasesStream, IPhaseData } from 'services/phases';
import { injectTFunc } from 'components/T/utils';
import { injectIdeasLoader, InjectedIdeaLoaderProps } from './ideasLoader';
import { InjectedResourcesLoaderProps, injectResources } from './resourcesLoader';
import { InjectedNestedResourceLoaderProps, injectNestedResources } from './nestedResourcesLoader';

// Components
import Button from 'components/UI/Button';
import FilterSidebar from './components/FilterSidebar';
import InfoSidebar from './components/InfoSidebar';
import Row from './components/Row';
import { Table, Input, Menu, Dropdown, Grid } from 'semantic-ui-react';

import messages from './messages';

type Props = InjectedIdeaLoaderProps & InjectedResourcesLoaderProps<IProjectData> & InjectedResourcesLoaderProps<ITopicData> & InjectedResourcesLoaderProps<IIdeaStatusData> & InjectedNestedResourceLoaderProps<IPhaseData> & {
  tFunc: ({}) => string;
};

type State = {
  selectedIdeas: {[key: string]: boolean},
};

class IdeaManagerPresentation extends React.PureComponent<Props, State> {

  constructor(props) {
    super(props);

    this.state = {
      selectedIdeas: {},
    };
  }

  handlePaginationClick = (page) => {
    this.props.onIdeaChangePage && this.props.onIdeaChangePage(page);
  }

  handleSortClick = (attribute) => () => {
    let newDirection: 'asc' | 'desc' = 'desc';
    if (this.props.ideaSortAttribute === attribute) {
      newDirection = this.props.ideaSortDirection === 'asc' ? 'desc' : 'asc';
    }
    this.props.onChangeIdeaSortAttribute && this.props.onChangeIdeaSortAttribute(attribute);
    this.props.onChangeIdeaSortDirection && this.props.onChangeIdeaSortDirection(newDirection);
  }

  handleSearchChange = (event) => {
    const term = event.target.value;
    this.props.onChangeSearchTerm && this.props.onChangeSearchTerm(term);
  }

  handleTopicChange = (event, data) => {
    const topic = data.value;
    this.props.onChangeTopicsFilter && this.props.onChangeTopicsFilter(topic);
  }

  handleProjectChange = (event, data) => {
    const project = data.value;
    this.props.onChangeProjectFilter && this.props.onChangeProjectFilter(project);
  }

  handleIdeaStatusFilterChange = (event, data) => {
    const ideaStatus = data.value;
    this.props.onChangeStatusFilter && this.props.onChangeStatusFilter(ideaStatus);
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

  selectIdea = (idea) => () => {
    const selectedIdeas = _.clone(this.state.selectedIdeas);
    selectedIdeas[idea.id] = true;
    this.setState({ selectedIdeas });
  }

  unselectIdea = (idea) => () => {
    const selectedIdeas = _.omit(this.state.selectedIdeas, [idea.id]);
    this.setState({ selectedIdeas });
  }

  toggleSelectIdea = (idea) => () => {
    if (this.state.selectedIdeas[idea.id]) {
      this.unselectIdea(idea)();
    } else {
      this.selectIdea(idea)();
    }
  }

  singleSelectIdea = (idea) => () => {
    this.setState({
      selectedIdeas: { [idea.id]: true },
    });
  }

  clearIdeaSelection = () => () => {
    this.setState({ selectedIdeas: {} });
  }

  isAnythingSelected = () => {
    return !_.isEmpty(this.state.selectedIdeas);
  }

  topicOptions = () => {
    return this.props.topics.all.map((topic) => ({
      value: topic.id,
      text: this.props.tFunc(topic.attributes.title_multiloc),
    }));
  }

  projectOptions = () => {
    return this.props.projects.all.map((project) => ({
      value: project.id,
      text: this.props.tFunc(project.attributes.title_multiloc),
    }));
  }

  ideaStatusOptions = () => {
    return this.props.ideaStatuses.all.map((status) => ({
      value: status.id,
      text: this.props.tFunc(status.attributes.title_multiloc),
    }));
  }

  ideaSelectionToIdeas = () => {
    return _.filter(this.props.ideas, (i) => this.state.selectedIdeas[i.id]);
  }


  render() {
    const { ideaSortAttribute, ideaSortDirection, ideaCurrentPageNumber, ideaLastPageNumber, ideas } = this.props;
    const { selectedIdeas } = this.state;
    const selectedIdeasData = this.ideaSelectionToIdeas();
    const showInfoSidebar = this.isAnythingSelected();

    return (
      <div>
        <Grid columns={3}>
          <Grid.Row>
            <Grid.Column width={13} floated="right">
              <Menu>
                <Menu.Item>
                  <Input icon="search" onChange={this.handleSearchChange} />
                </Menu.Item>
                <Menu.Menu position="right">
                  <Menu.Item>
                    <Dropdown placeholder="Topics" fluid={true} selection={true} options={this.topicOptions()} onChange={this.handleTopicChange} />
                  </Menu.Item>
                  <Menu.Item>
                    <Dropdown placeholder="Projects" fluid={true} selection={true} options={this.projectOptions()} onChange={this.handleProjectChange} />
                  </Menu.Item>
                  <Menu.Item>
                    <Dropdown placeholder="Status" fluid={true} selection={true} options={this.ideaStatusOptions()} onChange={this.handleIdeaStatusFilterChange} />
                  </Menu.Item>
                </Menu.Menu>
              </Menu>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={4}>
              <FilterSidebar
                phases={this.props.phases.all}
                topics={this.props.topics.all}
                selectedTopics={this.props.ideaTopicsFilter}
                selectedPhase={this.props.ideaPhaseFilter}
                onChangePhaseFilter={this.props.onChangePhaseFilter}
                onChangeTopicsFilter={this.props.onChangeTopicsFilter}
              />
            </Grid.Column>
            <Grid.Column width={showInfoSidebar ? 8 : 12}>
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell width={1} />
                    <Table.HeaderCell width={4}>
                      <FormattedMessage {...messages.title} />
                    </Table.HeaderCell>
                    <Table.HeaderCell width={2}>
                      <SortableTableHeader
                        direction={ideaSortAttribute === 'author_name' ? ideaSortDirection : null}
                        onToggle={this.handleSortClick('author_name')}
                      >
                        <FormattedMessage {...messages.author} />
                      </SortableTableHeader>
                    </Table.HeaderCell>
                    <Table.HeaderCell width={2}>
                      <SortableTableHeader
                        direction={ideaSortAttribute === 'new' ? ideaSortDirection : null}
                        onToggle={this.handleSortClick('new')}
                      >
                        <FormattedMessage {...messages.publication_date} />
                      </SortableTableHeader>
                    </Table.HeaderCell>
                    <Table.HeaderCell width={1}>
                      <SortableTableHeader
                        direction={ideaSortAttribute === 'upvotes_count' ? ideaSortDirection : null}
                        onToggle={this.handleSortClick('upvotes_count')}
                      >
                        <FormattedMessage {...messages.up} />
                      </SortableTableHeader>
                    </Table.HeaderCell >
                    <Table.HeaderCell width={1}>
                      <SortableTableHeader
                        direction={ideaSortAttribute === 'downvotes_count' ? ideaSortDirection : null}
                        onToggle={this.handleSortClick('downvotes_count')}
                      >
                        <FormattedMessage {...messages.down} />
                      </SortableTableHeader>
                    </Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {(ideas || []).map((idea) =>
                    <Row
                      key={idea.id}
                      idea={idea}
                      onDeleteIdea={this.handleDeleteIdea(idea)}
                      onSelectIdea={this.selectIdea(idea)}
                      onUnselectIdea={this.unselectIdea(idea)}
                      onToggleSelectIdea={this.toggleSelectIdea(idea)}
                      onSingleSelectIdea={this.singleSelectIdea(idea)}
                      selected={selectedIdeas[idea.id]}
                    />
                  )}
                </Table.Body>
                <Table.Footer fullWidth={true}>
                  <Table.Row>
                    <Table.HeaderCell colSpan="7">
                      <Pagination
                        currentPage={ideaCurrentPageNumber || 1}
                        totalPages={ideaLastPageNumber || 1}
                        loadPage={this.handlePaginationClick}
                      />
                    </Table.HeaderCell>
                  </Table.Row>
                </Table.Footer>
              </Table>
            </Grid.Column>
            {showInfoSidebar && <Grid.Column width={4}>
                <InfoSidebar
                  ideas={selectedIdeasData}
                />
              </Grid.Column>}
          </Grid.Row>
        </Grid>
      </div>
    );
  }
}


export default
  injectResources('projects', projectsStream)(
    injectResources('topics', topicsStream)(
      injectResources('ideaStatuses', ideaStatusesStream)(
        injectNestedResources('phases', phasesStream, (props) => props.project && props.project.id)(
          injectIdeasLoader(injectTFunc(IdeaManagerPresentation))))));
