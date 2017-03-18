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
      nextProps.onEditorChange(convertToRaw(editorState.getCurrentContent()));
    };

    // load eventually existing draft
    if (nextProps.content && this.state.editorState && !(this.state.editorState.getCurrentContent().equals(nextProps.content))) {
      this.setState({
        editorState: EditorState.createWithContent(convertFromRaw(nextProps.content)),
      });
    }
  }


  render() {
    const { editorState } = this.state;
    return (
      <div className="demo-root">
        <div className="demo-editorSection">
          <Editor
            hashtag={{}}
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
};
