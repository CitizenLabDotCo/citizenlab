/**
*
* SubmitIdeaEditor
*
*/

import React, { PropTypes } from 'react';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { EditorState, convertToRaw, convertFromRaw } from 'draft-js';

class SubmitIdeaEditor extends React.Component { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super(props);

    this.state = {
      editorContents: [],
    };
  }

  onChange = (editorContents) => {
    this.setState({
      editorContents,
    });

    // dispatch action from ascendant
    // this.props.onEditorChange(convertToRaw(editorState.getCurrentContent()));
  };

  componentDidMount() {
    this.props.loadDraft();
  }

  componentWillReceiveProps(nextProps) {
    // load eventually existing draft
    // if (nextProps.content && !(this.state.editorState.getCurrentContent().equals(nextProps.content))) {
    //   this.setState({
    //     editorState: EditorState.createWithContent(convertFromRaw(nextProps.content)),
    //   });
    // }
  }

  render() {
    const { editorContents } = this.state;
    return (
      <div className="demo-root">
        <div className="demo-label">
          Editor with output generated in HTML.
        </div>
        <div className="demo-editorSection">
          <Editor
            hashtag={{}}
            editorState={editorContents[0]}
            toolbarClassName="demo-toolbar"
            wrapperClassName="demo-wrapper"
            editorClassName="demo-editor"
            onEditorStateChange={this.onChange}
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

export default SubmitIdeaEditor;
