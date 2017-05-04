import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
/*
import { createStructuredSelector } from 'reselect';
import { Icon, Menu, Table } from 'semantic-ui-react';
import {
  selectPrevPageNumber,
  selectPrevPageItemCount,
  selectCurrentPageNumber,
  selectCurrentPageItemCount,
  selectNextPageNumber,
  selectNextPageItemCount,
  selectPageCount,
  selectLoadingUsers,
  selectLoadUsersError,
  makeSelectUsers,
} from './selectors';
import { loadUsers } from './actions';
*/

class SettingsPage extends React.Component { // eslint-disable-line react/prefer-stateless-function
  render() {
    return (
      <div>
        <h1>Settings</h1>
      </div>
    );
  }
}

SettingsPage.propTypes = {
  users: ImmutablePropTypes.list.isRequired,
  prevPageNumber: PropTypes.number,
  prevPageItemCount: PropTypes.number,
  currentPageNumber: PropTypes.number,
  currentPageItemCount: PropTypes.number,
  nextPageNumber: PropTypes.number,
  nextPageItemCount: PropTypes.number,
  pageCount: PropTypes.number,
  loadingUsers: PropTypes.bool.isRequired,
  loadUsersError: PropTypes.bool.isRequired,
  loadUsersPage: PropTypes.func.isRequired,
};

export default connect(null, null)(SettingsPage);
