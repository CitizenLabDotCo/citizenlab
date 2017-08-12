import React from 'react';
import PropTypes from 'prop-types';
import ImPropTypes from 'react-immutable-proptypes';


// components
import View from './card/view';

// store
import { preprocess } from 'utils';
import { createStructuredSelector } from 'reselect';
import { selectIdea, selectIdeaImages } from './selectors';

const Card = (props) => {
  if (!props.title) return null;

  return (
    <View {...props} />
  );
};

Card.propTypes = {
  title: ImPropTypes.map,
  createdAt: PropTypes.string,
  upvotesCount: PropTypes.number,
  downvotesCount: PropTypes.number,
  onClick: PropTypes.func,
  imageUrl: PropTypes.string,
  authorName: PropTypes.string,
  authorId: PropTypes.string,
  commentsCount: PropTypes.number,
};

const mapStateToProps = () => createStructuredSelector({
  idea: selectIdea,
  images: selectIdeaImages,
});

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { onClick } = ownProps;
  const { idea, images } = stateProps;
  if (!idea) return {};

  const ideaId = idea.get('id');
  const attributes = idea.get('attributes');
  const title = attributes.get('title_multiloc');
  const createdAt = attributes.get('published_at');
  const authorName = attributes.get('author_name');
  const authorId = idea.getIn(['relationships', 'author', 'data', 'id']);
  const firstImage = images.first();
  const imageUrl = firstImage && firstImage.getIn(['attributes', 'versions', 'medium']);
  const commentsCount = attributes.get('comments_count');

  return {
    ideaId,
    onClick,
    title,
    createdAt,
    imageUrl,
    authorName,
    authorId,
    commentsCount,
  };
};

export default preprocess(mapStateToProps, null, mergeProps)(Card);
