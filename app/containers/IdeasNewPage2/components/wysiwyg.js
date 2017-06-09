import React from 'react';
import PropTypes from 'prop-types';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

class Wysiwyg extends React.Component {
  onEditorStateChange = (editorState) => {
    this.props.onChange(editorState);
  }

  render() {
    return (
      <Editor
        editorState={this.props.editorState}
        onEditorStateChange={this.onEditorStateChange}
      />
    );
  }
}

Wysiwyg.propTypes = {
  editorState: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default Wysiwyg;
