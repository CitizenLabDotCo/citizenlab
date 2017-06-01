import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { push } from 'react-router-redux';

// components
import Row from './row';
import { Table } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';

// store
import { preprocess } from 'utils';
import { createStructuredSelector } from 'reselect';
import { loadUsersRequest } from 'resources/users/actions';
import InfiniteScroll from 'react-infinite-scroller';

// messages
import messages from './messages';

const AllUsers = ({ loaded, load, hasMore }) => (
  <div>
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
              <FormattedMessage {...messages.firstName} />
          </Table.HeaderCell>
          <Table.HeaderCell>
              <FormattedMessage {...messages.lastName} />
          </Table.HeaderCell>
          <Table.HeaderCell>
              <FormattedMessage {...messages.email} />
          </Table.HeaderCell>
          <Table.HeaderCell>
              <FormattedMessage {...messages.member} />
           since</Table.HeaderCell>
          <Table.HeaderCell>
              <FormattedMessage {...messages.admin} />
          </Table.HeaderCell>
          <Table.HeaderCell>
              <FormattedMessage {...messages.delete} />
          </Table.HeaderCell>

        </Table.Row>
      </Table.Header>

        <InfiniteScroll
          element={'tbody'}
          loadMore={load}
          initialLoad
          hasMore={hasMore}
          loader={<tr className="loader"></tr>}
        >
          {loaded.map((id) => <Row key={id} userId={id} />)}
        </InfiniteScroll>
    </Table>
  </div>
);

AllUsers.propTypes = {
  loaded: ImmutablePropTypes.list.isRequired,
  load: PropTypes.func.isRequired,
  hasMore: PropTypes.bool.isRequired,
};

const mapStateToProps = createStructuredSelector({
  loaded: (state) => state.getIn(['adminUsers', 'loaded']),
  nextPageNumber: (state) => state.getIn(['adminUsers', 'nextPageNumber']),
  nextPageItemCount: (state) => state.getIn(['adminUsers', 'nextPageItemCount']),
});

const mergeProps = (state, dispatch, own) => {
  const { loaded, nextPageNumber, nextPageItemCount } = state;
  const { location } = own;
  const { load, goTo } = dispatch;
  return {
    goToCreate: () => goTo(`${location.pathname}/create`),
    load: () => load(nextPageNumber, nextPageItemCount),
    hasMore: !!(nextPageNumber && nextPageItemCount),
    loaded,
  };
};

export default preprocess(mapStateToProps, { goTo: push, load: loadUsersRequest }, mergeProps)(AllUsers);

