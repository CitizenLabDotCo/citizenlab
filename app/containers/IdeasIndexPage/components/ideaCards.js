import React from 'react';
import PropTypes from 'prop-types';

// components
import InfiniteScroll from 'react-infinite-scroller';
import IdeaCard from 'components/IdeaCard';


// store
import { preprocess } from 'utils';
import { createStructuredSelector } from 'reselect';
import selectIdeasIndexPageDomain from 'containers/IdeasIndexPage/selectors';
import { loadNextPage } from 'containers/IdeasIndexPage/actions';

const IdeasCards = ({ ideas, hasMore, loadMoreIdeas }) => (
  <InfiniteScroll
    element={'div'}
    loadMore={loadMoreIdeas}
    className={'ui stackable cards'}
    initialLoad={false}
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
  ideas: selectIdeasIndexPageDomain('ideas'),
  nextPageNumber: selectIdeasIndexPageDomain('nextPageNumber'),
  nextPageItemCount: selectIdeasIndexPageDomain('nextPageItemCount'),
  search: (state) => state.getIn(['route', 'locationBeforeTransitions', 'search']),
});

const mergeProps = (
  { ideas, nextPageNumber, nextPageItemCount, search },
  { getNextPage },
  { filter, maxNumber, hasMore }) => ({
    loadMoreIdeas: getNextPage.bind(null, maxNumber || nextPageNumber, nextPageItemCount, search, filter),
    hasMore: hasMore || !!((maxNumber || nextPageNumber) && nextPageItemCount),
    ideas,
  });


export default preprocess(mapStateToProps, { getNextPage: loadNextPage }, mergeProps)(IdeasCards);
