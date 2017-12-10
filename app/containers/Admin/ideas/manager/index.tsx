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
import { InjectedResourceLoaderProps, injectResources } from './resourcesLoader';

// Components
import Button from 'components/UI/Button';
import Sidebar from './components/Sidebar';
import Row from './Row';
import { Table, Input, Menu, Dropdown, Grid } from 'semantic-ui-react';

import messages from './messages';

type Props = InjectedIdeaLoaderProps & InjectedResourceLoaderProps<IProjectData> & InjectedResourceLoaderProps<ITopicData> & InjectedResourceLoaderProps<IIdeaStatusData> & {
  tFunc: ({}) => string;
};

type State = {
  selectedIdeas: {[key: string]: boolean},
};

class IdeaManagerPresentation extends React.PureComponent<Props, State> {

  topicsObservable: Rx.Subscription;
  ideaStatusesObservable: Rx.Subscription;

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

  handleSelectIdea = (idea) => () => {
    const selectedIdeas = _.clone(this.state.selectedIdeas);
    selectedIdeas[idea.id] = true;
    this.setState({ selectedIdeas });
  }

  handleToggleSelectIdea = (idea) => () => {
    const selectedIdeas = _.clone(this.state.selectedIdeas);
    if (selectedIdeas[idea.id]) {
      delete selectedIdeas[idea.id];
    } else {
      selectedIdeas[idea.id] = true;
    }
    this.setState({ selectedIdeas });
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

  render() {
    const { ideaSortAttribute, ideaSortDirection, ideaCurrentPageNumber, ideaLastPageNumber, ideas } = this.props;
    const { selectedIdeas } = this.state;

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
            <Grid.Column width={3}>
              <Sidebar />
            </Grid.Column>
            <Grid.Column width={13}>
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
                    <Table.HeaderCell width={1}>
                      <FormattedMessage {...messages.delete} />
                    </Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {(ideas || []).map((idea) =>
                    <Row
                      key={idea.id}
                      idea={idea}
                      onDeleteIdea={this.handleDeleteIdea(idea)}
                      onSelectIdea={this.handleSelectIdea(idea)}
                      onToggleSelectIdea={this.handleToggleSelectIdea(idea)}
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
          </Grid.Row>
        </Grid>
      </div>
    );
  }
}


export default
  injectResources(projectsStream, 'projects')(
    injectResources(topicsStream, 'topics')(
      injectResources(ideaStatusesStream, 'ideaStatuses')(
        injectIdeasLoader(injectTFunc(IdeaManagerPresentation)))));
