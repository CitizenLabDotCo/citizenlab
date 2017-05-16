import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { Saga } from 'react-redux-saga';
import { bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';
import { Icon, Menu, Table } from 'semantic-ui-react';
import _ from 'lodash';
import {
  selectFirstPageNumber,
  selectFirstPageItemCount,
  selectPrevPageNumber,
  selectPrevPageItemCount,
  selectCurrentPageNumber,
  selectCurrentPageItemCount,
  selectNextPageNumber,
  selectNextPageItemCount,
  selectPageCount,
  selectLastPageNumber,
  selectLastPageItemCount,
  selectLoadingUsers,
  selectLoadUsersError,
  makeSelectUsers,
} from './selectors';
import { loadUsers } from './actions';
import { watchLoadUsers } from './sagas';

class UsersPage extends React.Component { // eslint-disable-line react/prefer-stateless-function
  componentDidMount() {
    this.props.loadUsers(1, 5, null, true);
  }


  goToPreviousUsersPage = () => {
    const { prevPageNumber, prevPageItemCount, lastPageNumber, lastPageItemCount, pageCount } = this.props;

    if (_.isNumber(prevPageNumber) && prevPageNumber >= 1) {
      this.props.loadUsers(prevPageNumber, prevPageItemCount, pageCount);
    } else {
      this.props.loadUsers(lastPageNumber, lastPageItemCount, pageCount);
    }
  }


  goToNextUsersPage = () => {
    const { firstPageNumber, firstPageItemCount, nextPageNumber, nextPageItemCount, pageCount } = this.props;

    if (_.isNumber(nextPageNumber) && nextPageNumber <= pageCount) {
      this.props.loadUsers(nextPageNumber, nextPageItemCount, pageCount);
    } else {
      this.props.loadUsers(firstPageNumber, firstPageItemCount, pageCount);
    }
  }


  goToUsersPage = (pageNumber) => () => {
    const { currentPageItemCount, pageCount } = this.props;
    this.props.loadUsers(pageNumber, currentPageItemCount, pageCount);
  }


  render() {
    let table = null;
    const pageNumbersArray = [];
    const { users, pageCount, loadingUsers, loadUsersError, currentPageNumber } = this.props;

    for (let i = 1; i <= pageCount; i += 1) {
      pageNumbersArray.push(i);
    }

    if (loadingUsers) {
      table = <div>Loading...</div>;
    } else if (loadUsersError) {
      table = <div>An error occured</div>;
    } else if (users && users.size > 0) {
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
            <Table.Row key={user.get('id')}>
              <Table.Cell>{user.getIn(['attributes', 'first_name'])}</Table.Cell>
              <Table.Cell>{user.getIn(['attributes', 'last_name'])}</Table.Cell>
              <Table.Cell>{user.getIn(['attributes', 'email'])}</Table.Cell>
              <Table.Cell>{user.getIn(['attributes', 'created_at'])}</Table.Cell>
            </Table.Row>)
          }
        </Table.Body>

        { (pageNumbersArray && pageNumbersArray.length > 1) ? (
          <Table.Footer>
            <Table.Row>
              <Table.HeaderCell colSpan="4">
                <Menu floated="right" pagination>

                  <Menu.Item as="a" icon onClick={this.goToPreviousUsersPage}>
                    <Icon name="left chevron" />
                  </Menu.Item>

                  {pageNumbersArray.map((pageNumber) =>
                    <Menu.Item
                      key={pageNumber}
                      active={pageNumber === currentPageNumber}
                      onClick={this.goToUsersPage(pageNumber)}
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
        <h1>Users</h1>
        <Saga saga={watchLoadUsers} />
        {table}
      </div>
    );
  }
}

UsersPage.propTypes = {
  users: ImmutablePropTypes.list.isRequired,
  firstPageNumber: PropTypes.number,
  firstPageItemCount: PropTypes.number,
  prevPageNumber: PropTypes.number,
  prevPageItemCount: PropTypes.number,
  currentPageNumber: PropTypes.number,
  currentPageItemCount: PropTypes.number,
  nextPageNumber: PropTypes.number,
  nextPageItemCount: PropTypes.number,
  lastPageNumber: PropTypes.number,
  lastPageItemCount: PropTypes.number,
  pageCount: PropTypes.number,
  loadingUsers: PropTypes.bool.isRequired,
  loadUsersError: PropTypes.bool.isRequired,
  loadUsers: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  users: makeSelectUsers(),
  firstPageNumber: selectFirstPageNumber,
  firstPageItemCount: selectFirstPageItemCount,
  prevPageNumber: selectPrevPageNumber,
  prevPageItemCount: selectPrevPageItemCount,
  currentPageNumber: selectCurrentPageNumber,
  currentPageItemCount: selectCurrentPageItemCount,
  nextPageNumber: selectNextPageNumber,
  nextPageItemCount: selectNextPageItemCount,
  lastPageNumber: selectLastPageNumber,
  lastPageItemCount: selectLastPageItemCount,
  pageCount: selectPageCount,
  loadingUsers: selectLoadingUsers,
  loadUsersError: selectLoadUsersError,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({ loadUsers }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(UsersPage);
