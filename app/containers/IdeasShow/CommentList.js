/**
*
* CommentList
*
*/

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Comment from './Comment';
import CommentEditorWrapper from './CommentEditorWrapper';

export const Comments = (props) => (<span>
  {props.comments.map((comment) =>
    (<div key={comment.id}>
      <Comment
        commentContent={comment.attributes.body_multiloc}
        parentId={comment.relationships.parent.data && comment.relationships.parent.data.id}
        createdAt={comment.attributes.created_at}
        modifiedAt={comment.attributes.modified_at}
        storeCommentDraftCopy={props.storeCommentDraftCopy}
        storeCommentError={props.storeCommentError}
        submittingComment={props.submittingComment}
        resetEditorContent={props.resetEditorContent}
      />
      {props.isNotTest && <CommentEditorWrapper
        storeCommentCopy={props.storeCommentDraftCopy}
        storeCommentError={props.storeCommentError}
        submittingComment={props.submittingComment}
        resetEditorContent={props.resetEditorContent}
        idea={props.idea}
        commentContent={props.commentContent}
        userId={props.userId}
        locale={props.locale}
        parentId={comment.id}
        publishCommentClick={props.publishCommentClick}
      />}
    </div>)
  )}
</span>);

class CommentList extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();

    this.state = {
      comments: [],
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      comments: nextProps.comments,
    });
  }

  render() {
    const { comments, className, storeCommentDraftCopy, storeCommentError, submittingComment, resetEditorContent, idea, commentContent, userId, locale, parentId, publishCommentClick } = this.props;

    return (
      <div className={className}>
        {storeCommentError && storeCommentError !== '' && <div>
          {storeCommentError}
        </div>}
        <Comments
          comments={comments}
          storeCommentDraftCopy={storeCommentDraftCopy}
          storeCommentError={storeCommentError}
          submittingComment={submittingComment}
          resetEditorContent={resetEditorContent}
          idea={idea}
          commentContent={commentContent}
          userId={userId}
          locale={locale}
          parentId={parentId}
          publishCommentClick={publishCommentClick}
          isNotTest
        />
      </div>
    );
  }
}

CommentList.propTypes = {
  comments: PropTypes.any.isRequired,
  className: PropTypes.string,
  storeCommentDraftCopy: PropTypes.func.isRequired,
  storeCommentError: PropTypes.string,
  submittingComment: PropTypes.bool.isRequired,
  resetEditorContent: PropTypes.bool.isRequired,
  parentId: PropTypes.string,
  idea: PropTypes.any,
  commentContent: PropTypes.string,
  userId: PropTypes.string,
  locale: PropTypes.string.isRequired,
  publishCommentClick: PropTypes.func.isRequired,
};

Comments.propTypes = {
  comments: PropTypes.any.isRequired,
  publishCommentClick: PropTypes.func.isRequired,
};

export default styled(CommentList)`
    // no style yet
`;
