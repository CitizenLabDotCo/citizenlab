import React from 'react';
import PropTypes from 'prop-types';
import ImPropTypes from 'react-immutable-proptypes';

// components
import View from './card/view';

// store
import { preprocess } from 'utils';
import { createStructuredSelector } from 'reselect';
import { selectResourcesDomain } from 'utils/resources/selectors';

const Card = ({ onClick, title, createdAt, upvotesCount, downvotesCount }) => {
  if (!title) return null;

  return (
    <View
      onClick={onClick}
      title={title}
      createdAt={createdAt}
      upvotesCount={upvotesCount}
      downvotesCount={downvotesCount}
    />
  );
};

Card.propTypes = {
  title: ImPropTypes.map,
  createdAt: PropTypes.string,
  upvotesCount: PropTypes.number,
  downvotesCount: PropTypes.number,
  onClick: PropTypes.func,
};

const mapStateToProps = () => createStructuredSelector({
  idea: (state, { id }) => selectResourcesDomain('ideas', id)(state),
});

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { onClick } = ownProps;
  const { idea } = stateProps;
  if (!idea) return {};

  const attributes = idea.get('attributes');
  const title = attributes.get('title_multiloc');
  const createdAt = attributes.get('published_at');
  const upvotesCount = attributes.get('upvotes_count');
  const downvotesCount = attributes.get('downvotes_count');

  return {
    onClick,
    title,
    createdAt,
    upvotesCount,
    downvotesCount,
  };
};

export default preprocess(mapStateToProps, null, mergeProps)(Card);
