/**
*
* CommentEditorWrapper
*
*/

import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';

import messages from './messages';
import CommentEditor from './CommentEditor';

export function CommentEditorWrapper(props) {
  const { className, storeCommentError, submittingComment, storeCommentCopy, resetEditorContent } = props;

  return (
    <div>
      <h2><FormattedMessage {...messages.commentEditorHeader} /></h2>
      {storeCommentError === '' && <FormattedMessage {...messages.emptyCommentError} />}
      {storeCommentError && storeCommentError !== '' && <div>
        {storeCommentError}
      </div>}
      {submittingComment && <FormattedMessage {...messages.submittingComment} />}

      <div className={className}>
        <CommentEditor
          onEditorChange={storeCommentCopy}
          resetContent={resetEditorContent}
        />
      </div>
    </div>
  );
}

CommentEditorWrapper.propTypes = {
  className: PropTypes.string,
  storeCommentCopy: PropTypes.func.isRequired,
  storeCommentError: PropTypes.string,
  submittingComment: PropTypes.bool.isRequired,
  resetEditorContent: PropTypes.bool.isRequired,
};

export default styled(CommentEditorWrapper)`
  height: 150px;
  border-radius: 3px;
  background-color: #ffffff;
  box-shadow: 0 4px 8px 0 rgba(81, 96, 115, 0.18);
`;
