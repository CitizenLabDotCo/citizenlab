import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

// components
import IdeaCard from 'components/IdeaCard';

import { FormattedMessage } from 'react-intl';
import messages from '../messages';

// store
import { preprocess } from 'utils';
import { createStructuredSelector } from 'reselect';
import selectIdeasIndexPageDomain from 'containers/IdeasIndexPage/selectors';
import { loadIdeasRequest, resetIdeas } from 'containers/IdeasIndexPage/actions';

// style
import { media } from 'utils/styleUtils';
import styled from 'styled-components';


const IdeasList = styled.div`
  font-size: 20px;
  color: #999;
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-top: 10px !important;
  ${media.tablet`
    flex-wrap: wrap;
  `}

  ${media.phone`
    flex-direction: column;
  `}
`;

const LoadMoreButton = styled.button`
  background: rgba(34, 34, 34, 0.05);
  color: #6b6b6b;
  flex: 1 0 100%;
  padding: 1.5rem 0;
  text-align: center;

  :hover{
    background: rgba(34, 34, 34, 0.10);
  }
`;

class IdeasCards extends React.Component {

  componentDidMount() {
    this.loadMoreIdeas();
  }

  componentWillReceiveProps(newProps) {
    if (!_.isEqual(newProps.filter, this.props.filter)) {
      this.props.reset();
      this.props.loadMoreIdeas(1, newProps.filter);
    }
  }

  loadMoreIdeas = () => {
    this.props.loadMoreIdeas(this.props.nextPageNumber, this.props.filter);
  }

  render() {
    const { hasMore, ideas } = this.props;
    return (
      <IdeasList>
        {ideas.map((id) => (
          <IdeaCard key={id} id={id} />
        ))}
        {hasMore &&
          <LoadMoreButton onClick={this.loadMoreIdeas}><FormattedMessage {...messages.loadMore} /></LoadMoreButton>
        }
      </IdeasList>
    );
  }
}

IdeasCards.propTypes = {
  loadMoreIdeas: PropTypes.func.isRequired,
  nextPageNumber: PropTypes.any,
  hasMore: PropTypes.bool,
  ideas: PropTypes.any,
  reset: PropTypes.func.isRequired,
  filter: PropTypes.object.isRequired,
};


const mapStateToProps = createStructuredSelector({
  ideas: selectIdeasIndexPageDomain('ideas'),
  nextPageNumber: selectIdeasIndexPageDomain('nextPageNumber'),
  nextPageSize: selectIdeasIndexPageDomain('nextPageItemCount'),
  hasMore: selectIdeasIndexPageDomain('hasMore'),
});

const mergeProps = (state, dispatch, own) => {
  const { ideas, nextPageNumber, nextPageSize, hasMore } = state;
  const { load, reset } = dispatch;
  const { filter, maxNumber } = own;

  return {
    loadMoreIdeas: (page, fltr) => load(page, maxNumber || nextPageSize, fltr),
    nextPageNumber,
    hasMore,
    ideas,
    reset,
    filter,
  };
};


export default preprocess(mapStateToProps, { load: loadIdeasRequest, reset: resetIdeas }, mergeProps)(IdeasCards);
