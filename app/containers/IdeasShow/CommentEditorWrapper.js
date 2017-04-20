/**
*
* CommentEditorWrapper
*
*/

import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { Button } from 'components/Foundation';

import messages from './messages';
import CommentEditor from './CommentEditor';

export class CommentEditorWrapper extends React.PureComponent {
  constructor() {
    super();

    // bind event handlers
    this.publishComment = this.publishComment.bind(this);
  }

  publishComment() {
    const { idea, commentContent, userId, locale, parentId, publishCommentClick } = this.props;
    publishCommentClick(idea.id, commentContent, userId, locale, parentId);
  }

  render() {
    const { className, submittingComment, storeCommentCopy, resetEditorContent, parentId } = this.props;

    return (
      <div>
        {!parentId && <h2><FormattedMessage {...messages.commentEditorHeader} /></h2>}
        {submittingComment && <FormattedMessage {...messages.submittingComment} />}

        <div className={className}>
          <CommentEditor
            onEditorChange={storeCommentCopy}
            resetContent={resetEditorContent}
            parentId={parentId}
          />
        </div>
        <Button onClick={this.publishComment}>
          <FormattedMessage {...messages.publishComment} />
        </Button>
      </div>
    );
  }
}

CommentEditorWrapper.propTypes = {
  className: PropTypes.string,
  storeCommentCopy: PropTypes.func.isRequired,
  submittingComment: PropTypes.bool.isRequired,
  resetEditorContent: PropTypes.bool.isRequired,
  parentId: PropTypes.string,
  idea: PropTypes.any,
  commentContent: PropTypes.string,
  userId: PropTypes.string,
  locale: PropTypes.string,
  publishCommentClick: PropTypes.func.isRequired,
};

export default styled(CommentEditorWrapper)`
  min-height: 2em;
  border-radius: 3px;
  background-color: #ffffff;
  box-shadow: 0 4px 8px 0 rgba(81, 96, 115, 0.18);
`;
