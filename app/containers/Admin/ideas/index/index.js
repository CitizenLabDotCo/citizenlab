import React, { Component } from 'react';
import styled from 'styled-components';

import { FormattedMessage } from 'react-intl';
import Pagination from 'components/admin/Pagination';
import SortableTableHeader from 'components/admin/SortableTableHeader';
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

class AllIdeas extends Component {

  constructor() {
    super();
    this.state = {
      sortAttribute: 'published_at',
      sortDirection: 'desc',
      ideas: [],
      currentPageNumber: 1,
      lastPageNumber: 1,
      searchTerm: '',
    };
  }

  handlePaginationClick = (page) => {
    this.setState({ currentPageNumber: page });
  }

  handleSortClick = (attribute) => {
    let newDirection = 'desc';
    if (this.state.sortAttribute === attribute) {
      newDirection = this.state.sortDirection === 'asc' ? 'desc' : 'asc';
    }
    this.setState({
      sortAttribute: attribute,
      sortDirection: newDirection,
    });
  }

  handleSearchChange = (event) => {
    this.setState({
      searchTerm: event.target.value,
      currentPageNumber: 1,
    });
  }

  render() {
    const { sortAttribute, sortDirection, currentPageNumber, lastPageNumber, ideas } = this.state;
    const topicsOptions = [
      { text: 'nature', value: 'nature' },
    ];
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
                <Dropdown placeholder="Topics" fluid multiple selection options={topicsOptions} />
              </Menu.Item>
              <Menu.Item>
                <Dropdown placeholder="Projects" fluid multiple selection options={topicsOptions} />
              </Menu.Item>
              <Menu.Item>
                <Dropdown placeholder="Status" fluid selection options={topicsOptions} />
              </Menu.Item>
            </Menu.Menu>
          </Menu>
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>
                  <SortableTableHeader
                    direction={sortAttribute === 'title_multiloc' ? sortDirection : null}
                    onToggle={() => this.handleSortClick('title_multiloc')}
                  >
                    <FormattedMessage {...messages.title} />
                  </SortableTableHeader>
                </Table.HeaderCell>
                <Table.HeaderCell>
                  <SortableTableHeader
                    direction={sortAttribute === 'author' ? sortDirection : null}
                    onToggle={() => this.handleSortClick('author')}
                  >
                    <FormattedMessage {...messages.author} />
                  </SortableTableHeader>
                </Table.HeaderCell>
                <Table.HeaderCell>
                  <SortableTableHeader
                    direction={sortAttribute === 'published_at' ? sortDirection : null}
                    onToggle={() => this.handleSortClick('published_at')}
                  >
                    <FormattedMessage {...messages.publication_date} />
                  </SortableTableHeader>
                </Table.HeaderCell>
                <Table.HeaderCell>
                  <SortableTableHeader
                    direction={sortAttribute === 'upvotes_count' ? sortDirection : null}
                    onToggle={() => this.handleSortClick('upvotes_count')}
                  >
                    <FormattedMessage {...messages.up} />
                  </SortableTableHeader>
                </Table.HeaderCell>
                <Table.HeaderCell>
                  <SortableTableHeader
                    direction={sortAttribute === 'downvotes_count' ? sortDirection : null}
                    onToggle={() => this.handleSortClick('downvotes_count')}
                  >
                    <FormattedMessage {...messages.down} />
                  </SortableTableHeader>
                </Table.HeaderCell>
                <Table.HeaderCell>
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
              {ideas.map((id) => <Row key={id} userId={id} />)}
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


export default AllIdeas;
