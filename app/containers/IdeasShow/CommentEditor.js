import React, { PropTypes } from 'react';
import { EditorState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import { Button } from 'components/Foundation';
import { FormattedMessage } from 'react-intl';

import messages from './messages';

export default class CommentEditor extends React.PureComponent {
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

  publishComment() {
    const { ideaId, locale, userId, parentId, publishCommentClick } = this.props;
    publishCommentClick(ideaId, this.state.editorState, userId, locale, parentId);
  }

  render() {
    const { editorState } = this.state;
    return (
      <div>
        <div>
          {/* TODO #later: customize toolbar and set up desired functions (image etc.)
              based on https://github.com/jpuri/react-draft-wysiwyg/blob/master/docs/src/components/Demo/index.js */}
          <Editor
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
          <div><Button onClick={this.publishComment}>
            <FormattedMessage {...messages.publishComment} />
          </Button></div>
        </div>
      </div>
    );
  }
}

CommentEditor.propTypes = {
  parentId: PropTypes.string,
  publishCommentClick: PropTypes.func.isRequired,
  ideaId: PropTypes.string.isRequired,
  userId: PropTypes.string,
  locale: PropTypes.string.isRequired,
};
