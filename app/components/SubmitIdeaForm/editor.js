/**
*
* SubmitIdeaEditor
*
*/

import React, { PropTypes } from 'react';
import { Editor, EditorState, convertToRaw, ContentState } from 'draft-js';

class SubmitIdeaEditor extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super(props);

    this.state = {
      editorState: EditorState.createEmpty(),
    };

    this.onChange = (editorState) => {
      this.setState({ editorState });

      // dispatch action from ascendant
      this.props.onEditorChange(convertToRaw(editorState.getCurrentContent()));
    };
  }

  componentDidMount() {
    this.props.loadDraft();
  }

  componentWillReceiveProps(nextProps) {
    // load eventually existing draft
    if (nextProps.content && !(this.state.editorState.getCurrentContent().equals(nextProps.content))) {
      this.setState({
        editorState: EditorState.createWithContent(
          ContentState.createFromBlockArray(nextProps.content)
        ),
      });
    }
  }

  render() {
    return (
      <Editor editorState={this.state.editorState} onChange={this.onChange} />
    );
  }
}

SubmitIdeaEditor.propTypes = {
  loadDraft: PropTypes.func.isRequired,
  onEditorChange: PropTypes.func.isRequired,
};

export default SubmitIdeaEditor;
