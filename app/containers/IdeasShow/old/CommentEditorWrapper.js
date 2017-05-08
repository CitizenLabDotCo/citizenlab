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

// eslint-disable-next-line  react/prefer-stateless-function
export class CommentEditorWrapper extends React.PureComponent {
  render() {
    const {
      className, submittingComment, resetEditorContent, parentId, idea, userId,
      publishCommentClick, locale,
    } = this.props;

    return (
      <div>
        {!parentId && <h2><FormattedMessage {...messages.commentEditorHeader} /></h2>}
        {submittingComment && <FormattedMessage {...messages.submittingComment} />}

        <div className={className}>
          <CommentEditor
            resetContent={resetEditorContent}
            parentId={parentId}
            ideaId={idea.id}
            userId={userId}
            publishCommentClick={publishCommentClick}
            locale={locale}
          />
        </div>
      </div>
    );
  }
}

CommentEditorWrapper.propTypes = {
  className: PropTypes.string,
  submittingComment: PropTypes.bool.isRequired,
  resetEditorContent: PropTypes.bool.isRequired,
  parentId: PropTypes.string,
  idea: PropTypes.any,
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
