import * as React from 'react';
import { push } from 'react-router-redux';
import styled from 'styled-components';

// components
import Row from './Row';
import { Table, Input } from 'semantic-ui-react';
import { FormattedMessage } from 'utils/cl-intl';
import Pagination from 'components/admin/Pagination';
import SortableTableHeader from 'components/admin/SortableTableHeader';
import PageWrapper from 'components/admin/PageWrapper';
import Button from 'components/UI/Button';

// store
import { preprocess } from 'utils';
import { createStructuredSelector } from 'reselect';
import { loadUsersWatcher, deleteUserWatcher } from 'resources/users/sagas';
import { resetUsers } from 'resources/users/actions';
import { wrapActionWithPrefix } from 'utils/resources/actions';
import { wrapSagaWithPrefix } from 'utils/resources/sagas';
import WatchSagas from 'utils/containers/watchSagas';


// messages
import messages from './messages';
import { ACTION_PREFIX } from './constants';
import { searchTermChanged, pageSelectionChanged, sortColumnChanged, initialLoad, loadUsersXlsxRequest } from './actions';
import localSagas from './sagas';

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
  margin: 0;
  margin-bottom: 30px;

  .no-padding-right button {
    padding-right: 0;
  }
`;

const HeaderTitle = styled.h1`
  color: #333;
  font-size: 35px;
  line-height: 40px;
  font-weight: 600;
  margin: 0;
  padding: 0;
`;

// Typing
interface Props {
  currentPageNumber: number;
  exportError?: string;
  exportLoading: boolean;
  initialLoad: Function;
  lastPageNumber: number;
  loadUsersXlsxRequest: {(event): void};
  pageSelectionChanged: Function;
  resetUsers: Function;
  searchTermChanged: Function;
  sortAttribute?: string;
  sortColumnChanged: Function;
  sortDirection?: string;
  userIds: any;
}

interface State {
}

class AllUsers extends React.Component<Props, State> {

  componentDidMount() {
    this.props.initialLoad();
  }

  componentWillUnmount() {
    this.props.resetUsers();
  }

  handlePaginationClick = (page) => {
    this.props.pageSelectionChanged(page);
  }

  handleSearchChange = (event) => {
    this.props.searchTermChanged(event.target.value);
  }

  handleSortClick = (attribute) => {
    this.props.sortColumnChanged(attribute);
  }

  createSortClickHandler = (attribute) => () => {
    this.handleSortClick(attribute);
  }

  render() {
    const { userIds, sortDirection, sortAttribute } = this.props;
    const sagas = {
      ...localSagas,
      loadUsers: wrapSagaWithPrefix(loadUsersWatcher, ACTION_PREFIX),
      deleteUser: wrapSagaWithPrefix(deleteUserWatcher, ACTION_PREFIX),
    };
    return (
      <div>
        <WatchSagas sagas={sagas} />
        <HeaderContainer>
          <HeaderTitle>
            <FormattedMessage {...messages.headerIndex} />
          </HeaderTitle>
          <Button
            className="no-padding-right"
            style={this.props.exportError ? 'error' : 'text'}
            onClick={this.props.loadUsersXlsxRequest}
            processing={this.props.exportLoading}
          >
            <FormattedMessage {...messages.exportUsers} />
          </Button>
        </HeaderContainer>
        <PageWrapper>
          <Input icon="search" onChange={this.handleSearchChange} />
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell />
                <Table.HeaderCell>
                  <SortableTableHeader
                    direction={sortAttribute === 'last_name' ? sortDirection : null}
                    onToggle={this.createSortClickHandler('last_name')}
                  >
                    <FormattedMessage {...messages.name} />
                  </SortableTableHeader>
                </Table.HeaderCell>
                <Table.HeaderCell>
                  <SortableTableHeader
                    direction={sortAttribute === 'email' ? sortDirection : null}
                    onToggle={this.createSortClickHandler('email')}
                  >
                    <FormattedMessage {...messages.email} />
                  </SortableTableHeader>
                </Table.HeaderCell>
                <Table.HeaderCell>
                  <SortableTableHeader
                    direction={sortAttribute === 'created_at' ? sortDirection : null}
                    onToggle={this.createSortClickHandler('created_at')}
                  >
                    <FormattedMessage {...messages.member} />
                  </SortableTableHeader>
                </Table.HeaderCell>
                <Table.HeaderCell>
                  <SortableTableHeader
                    direction={sortAttribute === 'role' ? sortDirection : null}
                    onToggle={this.createSortClickHandler('role')}
                  >
                    <FormattedMessage {...messages.admin} />
                  </SortableTableHeader>
                </Table.HeaderCell>
                <Table.HeaderCell>
                  <FormattedMessage {...messages.delete} />
                </Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {userIds.map((id) => <Row key={id} userId={id} />)}
            </Table.Body>
            <Table.Footer fullWidth={true}>
              <Table.Row>
                <Table.HeaderCell colSpan="6">
                  <Pagination
                    currentPage={this.props.currentPageNumber}
                    totalPages={this.props.lastPageNumber}
                    loadPage={this.handlePaginationClick}
                  />
                </Table.HeaderCell>
              </Table.Row>
            </Table.Footer>
          </Table>
        </PageWrapper>
      </div>
    );
  }
}

const mapStateToProps = createStructuredSelector({
  currentPageNumber: (state) => state.getIn(['adminUsersIndex', 'ui', 'selectedPage']),
  sortDirection: (state) => state.getIn(['adminUsersIndex', 'ui', 'sortDirection']),
  sortAttribute: (state) => state.getIn(['adminUsersIndex', 'ui', 'sortAttribute']),
  searchTerm: (state) => state.getIn(['adminUsersIndex', 'ui', 'searchTerm']),
  lastPageNumber: (state) => state.getIn(['adminUsersIndex', 'users', 'lastPageNumber']),
  userIds: (state) => state.getIn(['adminUsersIndex', 'users', 'ids']),
  exportLoading: (state) => state.getIn(['adminUsersIndex', 'ui', 'exportLoading']),
  exportError: (state) => state.getIn(['adminUsersIndex', 'ui', 'exportError']),
});

const mapDispatchToProps = {
  searchTermChanged,
  pageSelectionChanged,
  sortColumnChanged,
  initialLoad,
  loadUsersXlsxRequest,
  goTo: push,
  resetUsers: wrapActionWithPrefix(resetUsers, ACTION_PREFIX),
};

export default preprocess(mapStateToProps, mapDispatchToProps)(AllUsers);
