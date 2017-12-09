import * as React from 'react';
import * as Rx from 'rxjs';
import styled from 'styled-components';

import { FormattedMessage } from 'utils/cl-intl';
import Pagination from 'components/admin/Pagination';
import SortableTableHeader from 'components/admin/SortableTableHeader';
import { ideasStream, updateIdea, deleteIdea } from 'services/ideas';
import { topicsStream } from 'services/topics';
import { ideaStatusesStream } from 'services/ideaStatuses';
import { projectsStream } from 'services/projects';
import { getPageNumberFromUrl } from 'utils/paginationUtils';
import { injectTFunc } from 'components/T/utils';
import WatchSagas from 'utils/containers/watchSagas';

import { injectIdeasLoader, InjectedIdeaLoaderProps } from './ideasLoader';

// Components
import Button from 'components/UI/Button';

// import ExportLabel from 'components/admin/ExportLabel';
import { Table, Input, Menu, Dropdown } from 'semantic-ui-react';
import messages from './messages';
import Row from './Row';

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
  margin: 0;
  margin-bottom: 30px;
`;

const HeaderTitle = styled.h1`
  color: #333;
  font-size: 35px;
  line-height: 40px;
  font-weight: 600;
  margin: 0;
  padding: 0;
`;

const ExportLabelsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;

  .no-padding-right button {
    padding-right: 0;
    padding-top: .25em;
    padding-bottom: .25em;
  }
`;

type Props = {
  tFunc: ({}) => string;
};

type State = {
  topics: any[],
  projects: any[],
  ideaStatuses: any[],
};

class IdeaManagerPresentation extends React.PureComponent<Props & InjectedIdeaLoaderProps, State> {

  topicsObservable: Rx.Subscription;
  projectsObservable: Rx.Subscription;
  ideaStatusesObservable: Rx.Subscription;

  constructor(props) {
    super(props);

    this.state = {
      topics: [],
      projects: [],
      ideaStatuses: [],
    };
  }

  componentWillUnmount() {
    this.topicsObservable.unsubscribe();
    this.projectsObservable.unsubscribe();
    this.ideaStatusesObservable.unsubscribe();
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

  topicOptions = () => {
    return this.state.topics.map((topic) => ({
      value: topic.id,
      text: this.props.tFunc(topic.attributes.title_multiloc),
    }));
  }

  projectOptions = () => {
    return this.state.projects.map((project) => ({
      value: project.id,
      text: this.props.tFunc(project.attributes.title_multiloc),
    }));
  }

  ideaStatusOptions = () => {
    return this.state.ideaStatuses.map((status) => ({
      value: status.id,
      text: this.props.tFunc(status.attributes.title_multiloc),
    }));
  }

  render() {
    const { ideaSortAttribute, ideaSortDirection, ideaCurrentPageNumber, ideaLastPageNumber, ideas } = this.props;
    return (
      <div>
        <HeaderContainer>
          <HeaderTitle>
            <FormattedMessage {...messages.header} />
          </HeaderTitle>
        </HeaderContainer>
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
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell width={5}>
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
      </div>
    );
  }
}


export default injectIdeasLoader(injectTFunc(IdeaManagerPresentation));
