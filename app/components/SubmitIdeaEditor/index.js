import React, { PropTypes } from 'react';
import { EditorState, convertToRaw, convertFromRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
// eslint-disable-next-line no-unused-vars
import styles from 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

export default class SubmitIdeaEditor extends React.Component {
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
    if (nextProps.content && this.state.editorState && !this.state.initialStateSet) {
      this.setState({
        initialStateSet: true,
        editorState: EditorState.createWithContent(convertFromRaw(nextProps.content)),
      });
    }
  }


  render() {
    const { editorState } = this.state;
    return (
      <div className="demo-root">
        <div className="demo-editorSection">
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
            toolbarClassName="demo-toolbar"
            wrapperClassName="demo-wrapper"
            editorClassName="demo-editor"
            onEditorStateChange={this.onEditorStateChange}
          />
        </div>
      </div>
    );
  }
}

SubmitIdeaEditor.propTypes = {
  loadDraft: PropTypes.func.isRequired,
  onEditorChange: PropTypes.func.isRequired,
};
