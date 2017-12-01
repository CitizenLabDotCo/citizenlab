import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { push } from 'react-router-redux';

// components
import { Table } from 'semantic-ui-react';
import Row from './row';
import { FormattedMessage } from 'utils/cl-intl';
import ActionButton from 'components/buttons/action.js';

// store
import { preprocess } from 'utils';
import { createStructuredSelector } from 'reselect';
import { loadAreasRequest } from 'resources/areas/actions';
import InfiniteScroll from 'react-infinite-scroller';

// messages
import messages from './messages';

const AllAreas = ({ loaded, goToCreate, load, hasMore }) => (
  <div>
    <h1>
      <FormattedMessage {...messages.headerIndex} />
    </h1>
    <div style={{ clear: 'both', overflow: 'auto' }}>
      <ActionButton action={goToCreate} message={messages.createButton} fluid />
    </div>
    <Table celled>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>
            <FormattedMessage {...messages.tableTitle} />
          </Table.HeaderCell>
          <Table.HeaderCell>
            <FormattedMessage {...messages.updateButton} />
          </Table.HeaderCell>
          <Table.HeaderCell>
            <FormattedMessage {...messages.deleteButton} />
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
        {loaded.map((id) => <Row key={id} areaId={id} />)}
      </InfiniteScroll>
    </Table>
  </div>
);

AllAreas.propTypes = {
  loaded: ImmutablePropTypes.list.isRequired,
  goToCreate: PropTypes.func.isRequired,
  load: PropTypes.func.isRequired,
  hasMore: PropTypes.bool.isRequired,
};

const mapStateToProps = createStructuredSelector({
  loaded: (state) => state.getIn(['adminAreas', 'loaded']),
  nextPageNumber: (state) => state.getIn(['adminAreas', 'nextPageNumber']),
  nextPageItemCount: (state) => state.getIn(['adminAreas', 'nextPageItemCount']),
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

export default preprocess(mapStateToProps, { goTo: push, load: loadAreasRequest }, mergeProps)(AllAreas);

