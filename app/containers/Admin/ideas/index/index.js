import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { FormattedMessage } from 'react-intl';
import Pagination from 'components/admin/Pagination';
import SortableTableHeader from 'components/admin/SortableTableHeader';
import { observeIdeas } from 'services/ideas';
import { observeTopics } from 'services/topics';
import { observeIdeaStatuses } from 'services/idea_statuses';
import { observeProjects } from 'services/projects';
import { getPageNumberFromUrl } from 'utils/paginationUtils';
import { injectTFunc } from 'utils/containers/t/utils';


// import ExportLabel from 'components/admin/ExportLabel';
import { Table, Input, Menu, Dropdown } from 'semantic-ui-react';

import messages from './messages';
import Row from './Row';

const TableContainer = styled.div`
  background-color: #ffffff;
  border-radius: 5px;
  padding: 30px;
  bottom: 0px;
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 0px;
`;

const HeaderTitle = styled.h1`
  font-family: CircularStd;
  font-size: 35px;
  font-weight: bold;
  margin: 0;
  color: #101010;
`;

class AllIdeas extends PureComponent {

  constructor() {
    super();
    this.ideasObservable = null;
    this.topicsObservable = null;
    this.projectsObservable = null;
    this.ideaStatusesObservable = null;

    this.state = {
      sortAttribute: 'new',
      sortDirection: 'desc',
      ideas: [],
      topics: [],
      projects: [],
      ideaStatuses: [],
      currentPageNumber: 1,
      lastPageNumber: 1,
      searchTerm: '',
      selectedTopic: [],
      selectedProject: null,
      selectedIdeaStatus: null,
    };
  }

  componentDidMount() {
    this.resubscribeIdeas();

    this.topicsObservable = observeTopics().observable.subscribe((data) => {
      this.setState({
        topics: data.data,
      });
    });

    this.projectsObservable = observeProjects().observable.subscribe((data) => {
      this.setState({
        projects: data.data,
      });
    });

    this.ideaStatusesObservable = observeIdeaStatuses().observable.subscribe((data) => {
      this.setState({
        ideaStatuses: data.data,
      });
    });
  }

  componentWillUnmount() {
    this.ideasObservable.unsubscribe();
    this.topicsObservable.unsubscribe();
    this.projectsObservable.unsubscribe();
    this.ideaStatusesObservable.unsubscribe();
  }

  resubscribeIdeas() {
    if (this.ideasObservable) {
      this.ideasObservable.unsubscribe();
    }

    const sortSign = this.state.sortDirection === 'desc' ? '-' : '';
    const queryParams = {
      'page[size]': 10,
      'page[number]': this.state.currentPageNumber,
      search: this.state.searchTerm,
      sort: `${sortSign}${this.state.sortAttribute}`,
    };

    if (this.state.selectedProject) {
      queryParams.project = this.state.selectedProject;
    }

    if (this.state.selectedTopic) {
      queryParams['topics[]'] = this.state.selectedTopic;
    }

    if (this.state.selectedIdeaStatus) {
      queryParams.idea_status = this.state.selectedIdeaStatus;
    }

    this.ideasObservable = observeIdeas({
      queryParameters: queryParams,
    }).observable.subscribe((data) => {
      const currentPageNumber = getPageNumberFromUrl(data.links.self) || 1;
      const lastPageNumber = getPageNumberFromUrl(data.links.last) || currentPageNumber;
      this.setState({
        ideas: data.data,
        lastPageNumber: lastPageNumber || this.state.lastPageNumber,
      });
    });
  }

  handlePaginationClick = (page) => {
    this.setState({ currentPageNumber: page }, this.resubscribeIdeas);
  }

  handleSortClick = (attribute) => {
    let newDirection = 'desc';
    if (this.state.sortAttribute === attribute) {
      newDirection = this.state.sortDirection === 'asc' ? 'desc' : 'asc';
    }
    this.setState({
      sortAttribute: attribute,
      sortDirection: newDirection,
    }, this.resubscribeIdeas);
  }

  handleSearchChange = (event) => {
    this.setState({
      searchTerm: event.target.value,
      currentPageNumber: 1,
    }, this.resubscribeIdeas);
  }

  handleTopicChange = (event, data) => {
    this.setState({
      selectedTopic: data.value,
      currentPageNumber: 1,
    }, this.resubscribeIdeas);
  }

  handleProjectChange = (event, data) => {
    this.setState({
      selectedProject: data.value,
      currentPageNumber: 1,
    }, this.resubscribeIdeas);
  }

  handleIdeaStatusFilterChange = (event, data) => {
    this.setState({
      selectedIdeaStatus: data.value,
      currentPageNumber: 1,
    }, this.resubscribeIdeas);
  }

  // handleIdeaStatusChange = (idea, statusId) => {
  // }

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
    const { sortAttribute, sortDirection, currentPageNumber, lastPageNumber, ideas } = this.state;

    return (
      <div>
        <HeaderContainer>
          <HeaderTitle>
            <FormattedMessage {...messages.header} />
          </HeaderTitle>
          {/* <ExportLabel
            action={this.props.loadIdeasXlsxRequest}
            loading={this.props.exportLoading}
            error={this.props.exportError}
          >
            <FormattedMessage {...messages.exportIdeas} />
          </ExportLabel>
          <ExportLabel
            action={this.props.loadIdeasXlsxRequest}
            loading={this.props.exportLoading}
            error={this.props.exportError}
          >
            <FormattedMessage {...messages.exportIdeas} />
          </ExportLabel>*/}
        </HeaderContainer>
        <TableContainer>
          <Menu>
            <Menu.Item>
              <Input icon="search" onChange={this.handleSearchChange} />
            </Menu.Item>
            <Menu.Menu position="right">
              <Menu.Item>
                <Dropdown placeholder="Topics" fluid selection options={this.topicOptions()} onChange={this.handleTopicChange} />
              </Menu.Item>
              <Menu.Item>
                <Dropdown placeholder="Projects" fluid selection options={this.projectOptions()} onChange={this.handleProjectChange} />
              </Menu.Item>
              <Menu.Item>
                <Dropdown placeholder="Status" fluid selection options={this.ideaStatusOptions()} onChange={this.handleIdeaStatusFilterChange} />
              </Menu.Item>
            </Menu.Menu>
          </Menu>
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell width={5}>
                  <SortableTableHeader
                    direction={sortAttribute === 'title_multiloc' ? sortDirection : null}
                    onToggle={() => this.handleSortClick('title_multiloc')}
                  >
                    <FormattedMessage {...messages.title} />
                  </SortableTableHeader>
                </Table.HeaderCell>
                <Table.HeaderCell width={2}>
                  <SortableTableHeader
                    direction={sortAttribute === 'author' ? sortDirection : null}
                    onToggle={() => this.handleSortClick('author')}
                  >
                    <FormattedMessage {...messages.author} />
                  </SortableTableHeader>
                </Table.HeaderCell>
                <Table.HeaderCell width={2}>
                  <SortableTableHeader
                    direction={sortAttribute === 'new' ? sortDirection : null}
                    onToggle={() => this.handleSortClick('new')}
                  >
                    <FormattedMessage {...messages.publication_date} />
                  </SortableTableHeader>
                </Table.HeaderCell>
                <Table.HeaderCell width={1}>
                  <SortableTableHeader
                    direction={sortAttribute === 'upvotes_count' ? sortDirection : null}
                    onToggle={() => this.handleSortClick('upvotes_count')}
                  >
                    <FormattedMessage {...messages.up} />
                  </SortableTableHeader>
                </Table.HeaderCell >
                <Table.HeaderCell width={1}>
                  <SortableTableHeader
                    direction={sortAttribute === 'downvotes_count' ? sortDirection : null}
                    onToggle={() => this.handleSortClick('downvotes_count')}
                  >
                    <FormattedMessage {...messages.down} />
                  </SortableTableHeader>
                </Table.HeaderCell>
                <Table.HeaderCell width={2}>
                  <SortableTableHeader
                    direction={sortAttribute === 'implementation_status' ? sortDirection : null}
                    onToggle={() => this.handleSortClick('implementation_status')}
                  >
                    <FormattedMessage {...messages.status} />
                  </SortableTableHeader>
                </Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {ideas.map((idea) =>
                <Row
                  ideaStatuses={this.state.ideaStatuses}
                  key={idea.id}
                  idea={idea}
                  onIdeaStatusChange={(status) => this.handleIdeaStatusChange(idea, status)}
                />
              )}
            </Table.Body>
            <Table.Footer fullWidth>
              <Table.Row>
                <Table.HeaderCell colSpan="6">
                  <Pagination
                    currentPage={currentPageNumber}
                    totalPages={lastPageNumber}
                    loadPage={this.handlePaginationClick}
                  />
                </Table.HeaderCell>
              </Table.Row>
            </Table.Footer>
          </Table>
        </TableContainer>
      </div>
    );
  }
}

AllIdeas.propTypes = {
  tFunc: PropTypes.func.isRequired,
};


export default injectTFunc(AllIdeas);
