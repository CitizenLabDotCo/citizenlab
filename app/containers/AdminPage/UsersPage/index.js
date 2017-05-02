/*
 *
 * UsersPage
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { Icon, Menu, Table } from 'semantic-ui-react';
import {
  makeSelectUsers,
  makeSelectPrevPageNumber,
  makeSelectPrevPageItemCount,
  makeSelectCurrentPageNumber,
  makeSelectCurrentPageItemCount,
  makeSelectNextPageNumber,
  makeSelectNextPageItemCount,
  makeSelectPageCount,
  makeSelectLoadingUsers,
  makeSelectLoadUsersError,
} from './selectors';
import { loadUsers } from './actions';

class UsersPage extends React.Component { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();
    this.goToPreviousUsersPage = this.goToPreviousUsersPage.bind(this);
    this.goToNextUsersPage = this.goToNextUsersPage.bind(this);
    this.goToUsersPage = this.goToUsersPage.bind(this);
  }

  componentDidMount() {
    const { loadUsersPage } = this.props;
    loadUsersPage(1, 5, null, true);
  }


  goToPreviousUsersPage() {
    const { loadUsersPage, prevPageNumber, prevPageItemCount, pageCount } = this.props;
    loadUsersPage(prevPageNumber, prevPageItemCount, pageCount);
  }


  goToNextUsersPage() {
    const { loadUsersPage, nextPageNumber, nextPageItemCount, pageCount } = this.props;
    loadUsersPage(nextPageNumber, nextPageItemCount, pageCount);
  }


  goToUsersPage(pageNumber) {
    const { loadUsersPage, currentPageItemCount, pageCount } = this.props;
    loadUsersPage(pageNumber, currentPageItemCount, pageCount);
  }


  render() {
    let table = null;
    const pageNumbers = [];
    const { users, pageCount, loadingUsers, loadUsersError, currentPageNumber } = this.props;

    for (let i = 1; i <= pageCount; i += 1) {
      pageNumbers.push(i);
    }

    if (loadingUsers) {
      table = <div>Loading...</div>;
    } else if (loadUsersError) {
      table = <div>An error occured</div>;
    } else if (users && users.length > 0) {
      table = (<Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>First name</Table.HeaderCell>
            <Table.HeaderCell>Last name</Table.HeaderCell>
            <Table.HeaderCell>Email</Table.HeaderCell>
            <Table.HeaderCell>Member since</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {users.map((user) =>
            <Table.Row key={user.id}>
              <Table.Cell>{user.attributes.first_name}</Table.Cell>
              <Table.Cell>{user.attributes.last_name}</Table.Cell>
              <Table.Cell>{user.attributes.email}</Table.Cell>
              <Table.Cell>{user.attributes.created_at}</Table.Cell>
            </Table.Row>)
          }
        </Table.Body>

        { (pageNumbers && pageNumbers.length > 1) ? (
          <Table.Footer>
            <Table.Row>
              <Table.HeaderCell colSpan="4">
                <Menu floated="right" pagination>

                  <Menu.Item as="a" icon onClick={this.goToPreviousUsersPage}>
                    <Icon name="left chevron" />
                  </Menu.Item>

                  {pageNumbers.map((pageNumber) =>
                    <Menu.Item
                      key={pageNumber}
                      active={pageNumber === currentPageNumber}
                      onClick={() => this.goToUsersPage(pageNumber)}
                      as="a"
                    >{pageNumber}</Menu.Item>)
                  }

                  <Menu.Item as="a" icon onClick={this.goToNextUsersPage}>
                    <Icon name="right chevron" />
                  </Menu.Item>

                </Menu>
              </Table.HeaderCell>
            </Table.Row>
          </Table.Footer>) : null }
      </Table>);
    } else {
      table = <div>No users</div>;
    }

    return (
      <div>
        <h1>Admin</h1>
        {table}
      </div>
    );
  }
}

UsersPage.propTypes = {
  users: PropTypes.any,
  prevPageNumber: PropTypes.number,
  prevPageItemCount: PropTypes.number,
  currentPageNumber: PropTypes.number,
  currentPageItemCount: PropTypes.number,
  nextPageNumber: PropTypes.number,
  nextPageItemCount: PropTypes.number,
  // lastPageNumber: PropTypes.number,
  // lastPageItemCount: PropTypes.number,
  pageCount: PropTypes.number,
  loadingUsers: PropTypes.bool.isRequired,
  loadUsersError: PropTypes.bool.isRequired,
  loadUsersPage: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  users: makeSelectUsers(),
  prevPageNumber: makeSelectPrevPageNumber(),
  prevPageItemCount: makeSelectPrevPageItemCount(),
  currentPageNumber: makeSelectCurrentPageNumber(),
  currentPageItemCount: makeSelectCurrentPageItemCount(),
  nextPageNumber: makeSelectNextPageNumber(),
  nextPageItemCount: makeSelectNextPageItemCount(),
  // lastPageNumber: makeSelectNextPageNumber(),
  // lastPageItemCount: makeSelectNextPageItemCount(),
  pageCount: makeSelectPageCount(),
  loadingUsers: makeSelectLoadingUsers(),
  loadUsersError: makeSelectLoadUsersError(),
});

export function mapDispatchToProps(dispatch) {
  return {
    loadUsersPage(pageNumber, itemCount, pageCount, initialLoad = false) {
      dispatch(loadUsers(pageNumber, itemCount, pageCount, initialLoad));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(UsersPage);
