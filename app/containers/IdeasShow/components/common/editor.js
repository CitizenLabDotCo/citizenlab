import React from 'react';
import PropTypes from 'prop-types';
import { Button, Accordion } from 'semantic-ui-react';
import { Editor as TextBox } from 'react-draft-wysiwyg';

import { FormattedMessage, injectIntl } from 'react-intl';
import { EditorState, convertToRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';

import { createStructuredSelector } from 'reselect';
import { selectAuthDomain } from 'utils/auth/selectors';
import { preprocess } from 'utils';
import { publishComment, publishCommentError } from '../../actions';
import messages from '../../messages';

import DeleteButton from './deleteButton';

class Editor extends React.PureComponent {






  render() {
    const { editorState } = this.state;
    const { parentId, ideaId } = this.props;
    return (
      <Accordion >
        <Accordion.Title style={{ fontSize: '0px', height: '0' }}>
          <Button style={{ float: 'right' }}> Reply </Button>
        </Accordion.Title>
        <Accordion.Title style={{ fontSize: '0px', height: '0' }}>
          <DeleteButton
            commentId={parentId}
            ideaId={ideaId}
          >
            Delete
          </DeleteButton>
        </Accordion.Title>
        <div style={{ height: '40px' }} />
        <Accordion.Content>
          <CommentForm />
        </Accordion.Content>
      </Accordion>

    );
  }
}

Editor.propTypes = {
  submitComment: PropTypes.func,
  // currentUserId: PropTypes.string,
  parentId: PropTypes.string,
  ideaId: PropTypes.string,
};

// publishCommentClick


const publishCommentAction = (ideaId, userId, locale, parentId, editorState) => {
  if (!editorState) return publishCommentError('');

  const editorContent = convertToRaw(editorState.getCurrentContent());
  const htmlContent = draftToHtml(editorContent);
  if (htmlContent && htmlContent.trim() !== '<p></p>') {
    const htmlContents = {};
    htmlContents[locale] = htmlContent;
    return publishComment(ideaId, userId, htmlContents, parentId);
  }
  return publishCommentError('');
};

const mergeProps = (stateP, dispatchP, ownP) => {
  const { ideaId, parentId } = ownP;
  const { currentUserId } = stateP;
  const submitAction = dispatchP.publishCommentAction;
  const locale = ownP.intl.locale;
  const submitComment = submitAction.bind(undefined, ideaId, currentUserId, locale, parentId);


  return {
    currentUserId,
    submitComment,
    parentId,
    ideaId,
  };
};
const connectedEditor = preprocess(null, { publishCommentAction }, mergeProps)(Editor);
export default injectIntl(connectedEditor);