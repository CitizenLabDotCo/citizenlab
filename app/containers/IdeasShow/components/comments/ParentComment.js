import React from 'react';
import PropTypes from 'prop-types';
import { createStructuredSelector } from 'reselect';
import styled from 'styled-components';

import { preprocess } from 'utils';
import { selectResourcesDomain } from 'utils/resources/selectors';
import T from 'containers/T';

import Authorize from 'utils/containers/authorize';

// import MapChildren from './MapChildren';
import messages from '../../messages';
import ChildComment from './ChildComment';
import Editor from '../common/editor';
import Author from './Author';


const CommentContainer = styled.div`
  border: solid 1px #cdcdcd;
  border-radius: 3px;
  padding: 25px;
  margin-top: 10px;
`;

const CommentBody = styled.div`
  font-size: 16px;
  color: #8f8f8f;
  padding: 15px 0;
`;

class ParentComment extends React.Component {

  render() {
    const { content, children, createdAt, ideaId, commentId, authorId } = this.props;
    return (
      <div>
        <Author authorId={authorId} createdAt={createdAt} message={messages.authorSaid} />
        <CommentContainer>
          <CommentBody>
            <T value={content} />
          </CommentBody>
        </CommentContainer>
        {children && children.map(((node) => <ChildComment key={node.id} node={node} />))}
        <Authorize action={['comments', 'create']}>
          <Editor parentId={commentId} ideaId={ideaId} />
        </Authorize>
      </div>
    );
  }
}

ParentComment.propTypes = {
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
    comment,
    content,
    createdAt,
    children,
    authorId,
    commentId: id,
    ideaId,
  };
};

export default preprocess(mapStateToProps, null, mergeProps)(ParentComment);
