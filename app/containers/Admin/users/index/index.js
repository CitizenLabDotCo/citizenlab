import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { push } from 'react-router-redux';
import { Saga } from 'react-redux-saga';


// components
import Row from './row';
import { Table } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';
import Pagination from './pagination';

// store
import { preprocess } from 'utils';
import { createStructuredSelector } from 'reselect';
import { loadUsersRequest } from 'resources/users/actions';
import { makeLoadUsersWatcher } from 'resources/users/sagas';

// messages
import messages from './messages';
import { ACTION_PREFIX } from './constants';

class AllUsers extends React.Component {

  componentDidMount() {
    this.props.load(
      {
        'page[number]': this.props.currentPageNumber,
        'page[size]': this.props.pageCount,
      },
      { actionPrefix: ACTION_PREFIX }
    );
  }

  handlePaginationClick = (page) => {
    this.props.load(
      {
        'page[number]': page,
        'page[size]': this.props.pageCount,
      },
      { actionPrefix: ACTION_PREFIX }
    );
  }

  render() {
    const { userIds } = this.props;
    return (
      <div>
        <Saga saga={makeLoadUsersWatcher(ACTION_PREFIX)} />
        <h1>
          <FormattedMessage {...messages.headerIndex} />
        </h1>
        <Table celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>
                <FormattedMessage {...messages.avatar} />
              </Table.HeaderCell>
              <Table.HeaderCell>
                <FormattedMessage {...messages.name} />
              </Table.HeaderCell>
              <Table.HeaderCell>
                <FormattedMessage {...messages.email} />
              </Table.HeaderCell>
              <Table.HeaderCell>
                <FormattedMessage {...messages.member} />
              </Table.HeaderCell>
              <Table.HeaderCell>
                <FormattedMessage {...messages.admin} />
              </Table.HeaderCell>
              <Table.HeaderCell>
                <FormattedMessage {...messages.delete} />
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {userIds.map((id) => <Row key={id} userId={id} />)}
          </Table.Body>
          <Table.Footer fullWidth>
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
      </div>
    );
  }
}

AllUsers.propTypes = {
  userIds: ImmutablePropTypes.list.isRequired,
  load: PropTypes.func.isRequired,
  pageCount: PropTypes.number.isRequired,
  currentPageNumber: PropTypes.number.isRequired,
  lastPageNumber: PropTypes.number.isRequired,
};

const mapStateToProps = createStructuredSelector({
  loaded: (state) => state.getIn(['adminUsersIndex', 'loaded']),
  currentPageNumber: (state) => state.getIn(['adminUsersIndex', 'users', 'currentPageNumber']),
  lastPageNumber: (state) => state.getIn(['adminUsersIndex', 'users', 'lastPageNumber']),
  pageCount: (state) => state.getIn(['adminUsersIndex', 'users', 'pageCount']),
  userIds: (state) => state.getIn(['adminUsersIndex', 'users', 'ids']),
});

const mapDispatchToProps = {
  goTo: push,
  load: loadUsersRequest,
};

export default preprocess(mapStateToProps, mapDispatchToProps)(AllUsers);
