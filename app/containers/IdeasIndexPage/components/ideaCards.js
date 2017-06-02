import React from 'react';
import PropTypes from 'prop-types';

// components
import InfiniteScroll from 'react-infinite-scroller';
import IdeaCard from 'components/IdeaCard';


// store
import { preprocess } from 'utils';
import { createStructuredSelector } from 'reselect';
import selectIdeasIndexPageDomain from 'containers/IdeasIndexPage/selectors';
import { loadIdeasRequest, resetIdeas } from 'containers/IdeasIndexPage/actions';

// style
import { media } from 'utils/styleUtils';
import styled from 'styled-components';


const InfiniteScrollStyled = styled(InfiniteScroll)`
  font-size: 20px;
  color: #999;
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  margin-top: 10px !important;
  ${media.tablet`
    flex-wrap: wrap;
  `}

  ${media.phone`
    flex-direction: column;
  `}
`;

class IdeasCards extends React.Component {
  componentWillReceiveProps(newProps) {
    if (newProps.isNewSearch) this.props.resetIdeas();
  }
  render() {
    const { loadMoreIdeas, hasMore, ideas } = this.props;
    return (
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
  }
}

IdeasCards.propTypes = {
  ideas: PropTypes.any,
  hasMore: PropTypes.bool,
  loadMoreIdeas: PropTypes.func.isRequired,
};


const mapStateToProps = createStructuredSelector({
  ideas: selectIdeasIndexPageDomain('ideas'),
  nextPageNumber: selectIdeasIndexPageDomain('nextPageNumber'),
  nextPageItemCount: selectIdeasIndexPageDomain('nextPageItemCount'),
  lastSearch: selectIdeasIndexPageDomain('search'),
  newSearch: (state) => state.getIn(['route', 'locationBeforeTransitions', 'search']),
});

const mergeProps = (state, dispatch, own) => {
  const { ideas, nextPageNumber, nextPageItemCount, lastSearch, newSearch } = state;
  const { load, resetIdeas } = dispatch;
  const { filter, maxNumber } = own;
  let { hasMore } = own;
  const isNewSearch = lastSearch !== newSearch && nextPageNumber !==1;
  if (hasMore !== false) hasMore = !!(nextPageNumber && (maxNumber || nextPageItemCount)) || isNewSearch;
  console.log(isNewSearch, hasMore);
  return {
    loadMoreIdeas: () => load(nextPageNumber, maxNumber || nextPageItemCount, newSearch, filter),
    hasMore,
    ideas,
    isNewSearch,
    resetIdeas,
  };
};


export default preprocess(mapStateToProps, { load: loadIdeasRequest, resetIdeas }, mergeProps)(IdeasCards);
