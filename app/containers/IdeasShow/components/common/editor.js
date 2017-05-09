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
  constructor() {
    super();
    this.state = { EditorState: EditorState.createEmpty() };
    // provide 'this' context to bindings
    this.publishComment = this.publishComment.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.resetContent) {
      this.setState({ editorState: null });
      this.setState({ editorState: EditorState.createEmpty() });
    }
  }

  onEditorStateChange = (editorState) => {
    this.setState({ editorState });
  };


  publishComment() {
    this.props.submitComment(this.state.editorState);
  }

  render() {
    const { editorState } = this.state;
    const { parentId, ideaId } = this.props;
    if (!this.props.currentUserId) return <div> banana </div>;
    return (
      <Accordion >
        <Accordion.Title style={{ fontSize: '0px', height: '0' }}>
          <Button style={{ float: 'right' }}> Repply </Button>
        </Accordion.Title>
        <Accordion.Title style={{ fontSize: '0px', height: '0' }}>
          <DeleteButton
            style={{ float: 'right' }}
            commentId={parentId}
            ideaId={ideaId}
          >
            Delete
          </DeleteButton>
        </Accordion.Title>
        <div style={{ height: '40px' }} />
        <Accordion.Content>
          <div>
            {/* TODO #later: customize toolbar and set up desired functions (image etc.)
                based on https://github.com/jpuri/react-draft-wysiwyg/blob/master/docs/src/components/Demo/index.js */}
            <div style={{ border: '1px solid black' }}>
              <TextBox
                toolbarHidden
                toolbar={{
                  options: ['inline'],
                  inline: {
                    options: ['bold', 'italic', 'underline'],
                  },
                }}
                editorState={editorState}
                onEditorStateChange={this.onEditorStateChange}
              />
            </div>
            <Button style={{ width: '100%' }} onClick={this.publishComment}>
              <FormattedMessage {...messages.publishComment} />
            </Button>
          </div>
        </Accordion.Content>
      </Accordion>

    );
  }
}

Editor.propTypes = {
  submitComment: PropTypes.func,
  currentUserId: PropTypes.string,
  parentId: PropTypes.string,
  ideaId: PropTypes.string,
};

const mapStateToProps = createStructuredSelector({
  currentUserId: selectAuthDomain('id'),
});


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
const connectedEditor = preprocess(mapStateToProps, { publishCommentAction }, mergeProps)(Editor);
export default injectIntl(connectedEditor);

/*
// Old draft textBox
import { Editor as TextBox } from 'react-draft-wysiwyg';

  constructor() {
    super();

    this.state = {
      editorState: EditorState.createEmpty(),
    };

    // provide 'this' context to bindings
    this.publishComment = this.publishComment.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.resetContent) {
      this.setState({
        editorState: null,
      });
      this.setState({
        editorState: EditorState.createEmpty(),
      });
    }
  }

  onEditorStateChange = (editorState) => {
    this.setState({
      editorState,
    });
  };

<TextBox
  toolbarHidden
  toolbar={{
    options: ['inline'],
    inline: {
      options: ['bold', 'italic', 'underline'],
    },
  }}
  editorState={editorState}
  onEditorStateChange={this.onEditorStateChange}
/>

publishCommentClick(ideaId, editorState, userId, locale, parentId) {
  if (!editorState) {
    dispatch(publishCommentError(''));
  }

  const editorContent = convertToRaw(editorState.getCurrentContent());
  const htmlContent = draftToHtml(editorContent);

  if (htmlContent && htmlContent.trim() !== '<p></p>') {
    const htmlContents = {};
    htmlContents[locale] = htmlContent;
    dispatch(publishComment(ideaId, userId, htmlContents, parentId));
  } else {
    // empty comment error
    dispatch(publishCommentError(''));
  }
},


*/
