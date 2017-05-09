import React from 'react';
import PropTypes from 'prop-types';
import { Comment, Accordion, Button } from 'semantic-ui-react';
import { createStructuredSelector } from 'reselect';

import { preprocess } from 'utils';
import { selectResourcesDomain } from 'utils/resources/selectors';
import T from 'containers/T';
import MapChildren from './mapChildren';

import Editor from '../common/editor';
import Author from '../common/author';

const Show = ({ content, children, createdAt, ideaId, commentId, authorId }) => (
  <Comment>
    <Comment.Content>
      <Author authorId={authorId}>
        {createdAt}
      </Author>
      <Comment.Text>
        <T value={content} />
      </Comment.Text>
      {<Editor parentId={commentId} ideaId={ideaId} />}
    </Comment.Content>
    <MapChildren nodes={children} />
  </Comment>
);

Show.propTypes = {
  content: PropTypes.any,
  children: PropTypes.any,
  createdAt: PropTypes.string,
  authorId: PropTypes.string,
  ideaId: PropTypes.string,
  commentId: PropTypes.string,
};


const mapStateToProps = () => createStructuredSelector({
  comment: (state, { node }) => selectResourcesDomain('comments', node.id)(state),
});

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { comment } = stateProps;
  const { id, children } = ownProps.node;
  const attributes = comment.get('attributes');

  const content = attributes.get('body_multiloc');
  const createdAt = attributes.get('created_at');
  const authorId = comment.getIn(['relationships', 'author', 'data', 'id']);
  const ideaId = comment.getIn(['relationships', 'idea', 'data', 'id']);
  return {
    content,
    createdAt,
    children,
    authorId,
    commentId: id,
    ideaId,
  };
};

export default preprocess(mapStateToProps, null, mergeProps)(Show);
