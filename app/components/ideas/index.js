import React from 'react';
import PropTypes from 'prop-types';

// components
import InfiniteScroll from 'react-infinite-scroller';
import IdeaCard from 'components/IdeaCard';


// store
import { preprocess } from 'utils';
import { createStructuredSelector } from 'reselect';
import { loadIdeasRequest } from 'resources/ideas/actions';

const IdeasCards = ({ ideas, hasMore, loadMoreIdeas }) => (
  <InfiniteScroll
    element={'div'}
    loadMore={loadMoreIdeas}
    className={'ui stackable cards'}
    initialLoad
    hasMore={hasMore}
    loader={<div className="loader"></div>}
  >
    {ideas.map((id) => (
      <IdeaCard key={id} id={id} />
    ))}
  </InfiniteScroll>
);

IdeasCards.propTypes = {
  ideas: PropTypes.any,
  hasMore: PropTypes.bool,
  loadMoreIdeas: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  ideas: (state) => state.getIn(['ideasIndex', 'list']),
  nextPageNumber: (state) => state.getIn(['ideasIndex', 'nextPageNumber']),
  nextPageItemCount: (state) => state.getIn(['ideasIndex', 'nextPageItemCount']),
  search: (state) => state.getIn(['route', 'locationBeforeTransitions', 'search']),
});

const mergeProps = (state, dispatch, own) => {
  const { ideas, nextPageNumber, nextPageItemCount, search } = state;
  const { load } = dispatch;
  const { filter, maxNumber } = own;
  let { hasMore } = own;
  if (hasMore !== false) hasMore = !!(nextPageNumber && (maxNumber || nextPageItemCount));

  return {
    loadMoreIdeas: () => load(nextPageNumber, maxNumber || nextPageItemCount, search, filter),
    hasMore,
    ideas,
  };
};


export default preprocess(mapStateToProps, { load: loadIdeasRequest }, mergeProps)(IdeasCards);
