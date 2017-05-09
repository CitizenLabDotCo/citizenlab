/**
*
* CommentList
*
*/

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { Comment } from 'semantic-ui-react';
import makeSelectIdeasShow, { makeSelectComments } from 'containers/IdeasShow/selectors';

import MapChildren from './comments/mapChildren';


class CommentContainer extends React.Component { // eslint-disable-line react/prefer-stateless-function
  render() {
    const { comments, className, storeCommentError, submittingComment, resetEditorContent, idea, userId, parentId, publishCommentClick } = this.props;
    if (!comments) return null;
    return (
      <div className={className}>
        {storeCommentError && storeCommentError !== '' && <div>
          {storeCommentError}
        </div>}
        <Comment.Group minimal>
          <MapChildren
            nodes={comments}
            storeCommentError={storeCommentError}
            submittingComment={submittingComment}
            resetEditorContent={resetEditorContent}
            idea={idea}
            userId={userId}
            parentId={parentId}
            publishCommentClick={publishCommentClick}
          />
        </Comment.Group>
      </div>
    );
  }
}

CommentContainer.propTypes = {
  comments: PropTypes.any,
  className: PropTypes.string,
  storeCommentError: PropTypes.string,
  submittingComment: PropTypes.bool.isRequired,
  resetEditorContent: PropTypes.bool.isRequired,
  parentId: PropTypes.string,
  idea: PropTypes.any,
  userId: PropTypes.string,
  publishCommentClick: PropTypes.func,
};

const mapStateToProps = createStructuredSelector({
  comments: makeSelectComments,
  storeCommentError: makeSelectIdeasShow('storeCommentError'),
  submittingComment: makeSelectIdeasShow('submittingComment'),
  resetEditorContent: makeSelectIdeasShow('resetEditorContent'),
});

export default connect(mapStateToProps)(CommentContainer);
