import React from 'react';
import PropTypes from 'prop-types';
import { Comment } from 'semantic-ui-react';
import T from 'containers/T';

import MapChildren from './mapChildren';

import { createStructuredSelector } from 'reselect';
import { preprocess } from 'utils';
import { selectResourcesDomain } from 'utils/resources/selectors';

import Author from '../common/author';

const Show = ({ content, children, createdAt, id, authorId }) => (
  <Comment>
    <Comment.Content>
      <Author authorId={authorId}>
        {createdAt}
      </Author>
      <Comment.Text>
        <T value={content} />
      </Comment.Text>
      <Comment.Actions>
        <Comment.Action>Reply</Comment.Action>
      </Comment.Actions>
    </Comment.Content>
    <MapChildren nodes={children} />
  </Comment>
);

Show.propTypes = {
  content: PropTypes.any,
  children: PropTypes.any,
};


const mapStateToProps = () => {
  return createStructuredSelector({
    comment: (state, { node }) => selectResourcesDomain('comments', node.id)(state),
  });
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { comment } = stateProps;
  const { id, children } = ownProps.node;
  const attributes = comment.get('attributes');

  const content = attributes.get('body_multiloc');
  const createdAt = attributes.get('created_at');
  const authorId = comment.getIn(['relationships', 'author', 'data', 'id']);
  return {
    content,
    createdAt,
    children,
    authorId,
    id,
  };
};

export default preprocess(mapStateToProps, null, mergeProps)(Show);
