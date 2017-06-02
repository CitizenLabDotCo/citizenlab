import React from 'react';
import PropTypes from 'prop-types';
import ImPropTypes from 'react-immutable-proptypes';

// components
import View from './card/view';

// store
import { preprocess } from 'utils';
import { createStructuredSelector } from 'reselect';
import { push } from 'react-router-redux';
import { selectResourcesDomain } from 'utils/resources/selectors';

const Card = ({ viewIdea, title, createdAt, upvotesCount, downvotesCount }) => {
  if (!title) return null;

  return (
    <View
      onClick={viewIdea}
      title={title}
      createdAt={createdAt}
      upvotesCount={upvotesCount}
      downvotesCount={downvotesCount}
    />
  );
};

Card.propTypes = {
  viewIdea: PropTypes.func.isRequired,
  title: ImPropTypes.map,
  createdAt: PropTypes.string.isRequired,
  upvotesCount: PropTypes.number.isRequired,
  downvotesCount: PropTypes.number.isRequired,
};

const mapStateToProps = () => createStructuredSelector({
  idea: (state, { id }) => selectResourcesDomain('ideas', id)(state),
});

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { id } = ownProps;
  const { goTo } = dispatchProps;
  const { idea } = stateProps;
  if (!idea) return {};

  const attributes = idea.get('attributes');
  const title = attributes.get('title_multiloc');
  const createdAt = attributes.get('published_at');
  const upvotesCount = attributes.get('upvotes_count');
  const downvotesCount = attributes.get('downvotes_count');

  const viewIdea = () => goTo(`/ideas/${id}`);
  return {
    viewIdea,
    title,
    createdAt,
    upvotesCount,
    downvotesCount,
  };
};

export default preprocess(mapStateToProps, { goTo: push }, mergeProps)(Card);
