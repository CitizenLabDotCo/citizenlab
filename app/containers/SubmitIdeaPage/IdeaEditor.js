import React, { PropTypes } from 'react';
import { EditorState, convertToRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
// eslint-disable-next-line no-unused-vars
import styles from 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { getEditorState } from './editorState';

export default class IdeaEditor extends React.PureComponent {
  constructor() {
    super();

    this.state = {
      editorState: EditorState.createEmpty(),
      initialStateSet: false,
    };
  }

  componentDidMount() {
    this.props.loadDraft();
  }

  componentWillReceiveProps(nextProps) {
    this.onEditorStateChange = (editorState) => {
      this.setState({
        editorState,
      });

      // store temp draft
      this.props.onEditorChange(convertToRaw(editorState.getCurrentContent()));
    };

    // load eventually existing draft
    const nextState = getEditorState(nextProps.content, this.state.editorState, this.state.initialStateSet);
    if (nextState) {
      this.setState({
        initialStateSet: true,
        editorState: nextState,
      });
    }
  }


  render() {
    const { editorState } = this.state;
    return (
      <div>
        <div>
          {/* TODO #later: customize toolbar and set up desired functions (image etc.)
              based on https://github.com/jpuri/react-draft-wysiwyg/blob/master/docs/src/components/Demo/index.js */}
          <Editor
            hashtag={{}}
            toolbar={{
              options: ['fontSize', 'fontFamily', 'list', 'textAlign', 'blockType', 'link', 'inline'],
              inline: {
                options: ['bold', 'italic', 'underline', 'strikethrough', 'superscript', 'subscript'],
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

IdeaEditor.propTypes = {
  loadDraft: PropTypes.func.isRequired,
  onEditorChange: PropTypes.func.isRequired,
};
