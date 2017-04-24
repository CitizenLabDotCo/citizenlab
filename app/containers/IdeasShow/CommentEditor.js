import React, { PropTypes } from 'react';
import { EditorState, convertToRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';

export default class CommentEditor extends React.PureComponent {
  constructor() {
    super();

    this.state = {
      editorState: EditorState.createEmpty(),
    };

    // set bindings
    this.onEditorStateChange.bind(this);
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

    const { onEditorChange, parentId } = this.props;

    // store temp draft
    onEditorChange(convertToRaw(editorState.getCurrentContent()), parentId);
  };

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
        </div>
      </div>
    );
  }
}

CommentEditor.propTypes = {
  onEditorChange: PropTypes.func.isRequired,
  parentId: PropTypes.string,
};
