import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';

import { FormattedMessage } from 'react-intl';
import Pagination from 'components/admin/Pagination';
import SortableTableHeader from 'components/admin/SortableTableHeader';
import { ideasStream, updateIdea } from 'services/ideas';
import { topicsStream } from 'services/topics';
import { ideaStatusesStream } from 'services/ideaStatuses';
import { projectsStream } from 'services/projects';
import { getPageNumberFromUrl } from 'utils/paginationUtils';
import { injectTFunc } from 'utils/containers/t/utils';
import WatchSagas from 'utils/containers/watchSagas';

// import ExportLabel from 'components/admin/ExportLabel';
import { Table, Input, Menu, Dropdown } from 'semantic-ui-react';
import ExportLabel from 'components/admin/ExportLabel';
import { loadIdeasXlsxRequest, loadCommentsXlsxRequest } from './actions';
import messages from './messages';
import sagas from './sagas';
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

const ExportLabelsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
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

    this.topicsObservable = topicsStream().observable.subscribe((data) => {
      this.setState({
        topics: data.data,
      });
    });

    this.projectsObservable = projectsStream().observable.subscribe((data) => {
      this.setState({
        projects: data.data,
      });
    });

    this.ideaStatusesObservable = ideaStatusesStream().observable.subscribe((data) => {
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

    this.ideasObservable = ideasStream({
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

  handleIdeaStatusChange = (idea, statusId) => {
    updateIdea(
      idea.id,
      { idea_status_id: statusId },
    );
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
    const { sortAttribute, sortDirection, currentPageNumber, lastPageNumber, ideas } = this.state;
    return (
      <div>
        <WatchSagas sagas={sagas} />
        <HeaderContainer>
          <HeaderTitle>
            <FormattedMessage {...messages.header} />
          </HeaderTitle>
          <ExportLabelsContainer>
            <ExportLabel
              action={this.props.loadIdeasXlsxRequest}
              loading={this.props.exportIdeasLoading}
              error={this.props.exportIdeasError}
            >
              <FormattedMessage {...messages.exportIdeas} />
            </ExportLabel>
            <ExportLabel
              action={this.props.loadCommentsXlsxRequest}
              loading={this.props.exportCommentsLoading}
              error={this.props.exportCommentsError}
            >
              <FormattedMessage {...messages.exportComments} />
            </ExportLabel>
          </ExportLabelsContainer>
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
                  <FormattedMessage {...messages.title} />
                </Table.HeaderCell>
                <Table.HeaderCell width={2}>
                  <SortableTableHeader
                    direction={sortAttribute === 'author_name' ? sortDirection : null}
                    onToggle={() => this.handleSortClick('author_name')}
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
                    direction={sortAttribute === 'status' ? sortDirection : null}
                    onToggle={() => this.handleSortClick('status')}
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
  loadIdeasXlsxRequest: PropTypes.func.isRequired,
  loadCommentsXlsxRequest: PropTypes.func.isRequired,
  exportIdeasLoading: PropTypes.bool.isRequired,
  exportCommentsLoading: PropTypes.bool.isRequired,
  exportIdeasError: PropTypes.string,
  exportCommentsError: PropTypes.string,
};

const mapStateToProps = createStructuredSelector({
  exportIdeasLoading: (state) => state.getIn(['adminIdeasIndex', 'exportIdeasLoading']),
  exportCommentsLoading: (state) => state.getIn(['adminIdeasIndex', 'exportCommentsLoading']),
  exportIdeasError: (state) => state.getIn(['adminIdeasIndex', 'exportIdeasError']),
  exportCommentsError: (state) => state.getIn(['adminIdeasIndex', 'exportCommentsError']),
});

const mapDispatchToProps = {
  loadIdeasXlsxRequest,
  loadCommentsXlsxRequest,
};

export default injectTFunc(connect(mapStateToProps, mapDispatchToProps)(AllIdeas));
