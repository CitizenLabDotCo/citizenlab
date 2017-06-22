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
  constructor() {
    super();
    this.first = true;
  }

  componentWillReceiveProps(newProps) {
    if (newProps.nextPageNumber !== this.props.nextPageNumber) this.first = true;
    if (newProps.isNewSearch) this.props.reset();
  }

  loadMoreIdeas = () => {
    if (this.first) this.props.loadMoreIdeas();
    this.first = false;
  }

  render() {
    const { hasMore, ideas } = this.props;
    return (
      <InfiniteScrollStyled
        element={'div'}
        loadMore={this.loadMoreIdeas}
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
  nextPageNumber: PropTypes.any,
  ideas: PropTypes.any,
  hasMore: PropTypes.bool,
  loadMoreIdeas: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
};


const mapStateToProps = createStructuredSelector({
  ideas: selectIdeasIndexPageDomain('ideas'),
  nextPageNumber: selectIdeasIndexPageDomain('nextPageNumber'),
  nextPageSize: selectIdeasIndexPageDomain('nextPageItemCount'),
  lastSearch: selectIdeasIndexPageDomain('search'),
  newSearch: (state) => state.getIn(['route', 'locationBeforeTransitions', 'search']),
});

const mergeProps = (state, dispatch, own) => {
  const { ideas, nextPageNumber, nextPageSize, lastSearch, newSearch } = state;
  const { load, reset } = dispatch;
  const { filter, maxNumber } = own;
  let { hasMore } = own;
  const isNewSearch = lastSearch !== newSearch && nextPageNumber !== 1;
  if (hasMore !== false) hasMore = !!(nextPageNumber && (maxNumber || nextPageSize)) || isNewSearch;

  return {
    nextPageNumber,
    loadMoreIdeas: () => load(nextPageNumber, maxNumber || nextPageSize, newSearch, filter),
    hasMore,
    ideas,
    isNewSearch,
    reset,
  };
};


export default preprocess(mapStateToProps, { load: loadIdeasRequest, reset: resetIdeas }, mergeProps)(IdeasCards);
