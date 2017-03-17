import React, { Component } from 'react';
import { convertToRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import styles from 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

export default class SubmitIdeaEditor extends Component {

  constructor() {
    super();

    this.state = {
      editorContents: [],
    };
  }

  onEditorStateChange = (index, editorContent) => {
    let editorContents = this.state.editorContents;
    editorContents[index] = editorContent;
    editorContents = [...editorContents];
    this.setState({
      editorContents,
    });
  };

  render() {
    const { editorContents } = this.state;
    return (
      <div className="demo-root">
        <div className="demo-editorSection">
          <Editor
            hashtag={{}}
            editorState={editorContents[0]}
            toolbarClassName="demo-toolbar"
            wrapperClassName="demo-wrapper"
            editorClassName="demo-editor"
            onEditorStateChange={this.onEditorStateChange.bind(this, 0)}
          />
        </div>
      </div>
    );
  }
}
