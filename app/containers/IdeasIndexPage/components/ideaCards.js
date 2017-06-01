import React from 'react';
import PropTypes from 'prop-types';

// components
import InfiniteScroll from 'react-infinite-scroller';
import IdeaCard from 'components/IdeaCard';


// store
import { preprocess } from 'utils';
import { createStructuredSelector } from 'reselect';
import selectIdeasIndexPageDomain from 'containers/IdeasIndexPage/selectors';
import { loadIdeasRequest } from 'containers/IdeasIndexPage/actions';

// style
import { media } from 'utils/styleUtils';
import styled from 'styled-components';


const InfiniteScrollStyled = styled(InfiniteScroll)`
  font-size: 20px;
  color: #999;
  margin-top: 10px;
  display: flex;
  justify-content: space-between;

  ${media.tablet`
    flex-wrap: wrap;
  `}

  ${media.phone`
    flex-direction: column;
  `}
`;

const IdeasCards = ({ ideas, hasMore, loadMoreIdeas }) => (
  <InfiniteScrollStyled
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
  </InfiniteScrollStyled>
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
