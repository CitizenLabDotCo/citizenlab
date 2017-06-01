import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { push } from 'react-router-redux';

// components
import Item from './all/item';
import { FormattedMessage } from 'react-intl';
import ActionButton from 'components/buttons/action.js';

// store
import { preprocess } from 'utils';
import { createStructuredSelector } from 'reselect';
import { loadPagesRequest } from 'resources/pages/actions';
import InfiniteScroll from 'react-infinite-scroller';

// messages
import messages from './messages';

const AllPages = ({ loaded, goToCreate, load, hasMore }) => (
  <div>
    <h1>
      <FormattedMessage {...messages.headerIndex} />
    </h1>
    <div style={{ clear: 'both', overflow: 'auto' }}>
      <ActionButton action={goToCreate} message={messages.createButton} fluid />
    </div>
    <InfiniteScroll
      element={'div'}
      loadMore={load}
      initialLoad
      hasMore={hasMore}
      loader={<div className="loader"></div>}
    >
      {loaded.map((id) => <Item key={id} pageId={id} />)}
    </InfiniteScroll>
  </div>
);

AllPages.propTypes = {
  loaded: ImmutablePropTypes.list.isRequired,
  goToCreate: PropTypes.func.isRequired,
  load: PropTypes.func.isRequired,
  hasMore: PropTypes.bool.isRequired,
};

const mapStateToProps = createStructuredSelector({
  loaded: (state) => state.getIn(['adminPages', 'loaded']),
  nextPageNumber: (state) => state.getIn(['adminPages', 'nextPageNumber']),
  nextPageItemCount: (state) => state.getIn(['adminPages', 'nextPageItemCount']),
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

export default preprocess(mapStateToProps, { goTo: push, load: loadPagesRequest }, mergeProps)(AllPages);

