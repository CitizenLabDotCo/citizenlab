import React from 'react';
import PropTypes from 'prop-types';
import { EditorState, convertToRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { getFromState } from 'utils/immutables';

import { getEditorState } from './editorState';
import { selectSubmitIdea } from './selectors';

class IdeaEditor extends React.PureComponent {
  constructor() {
    super();

    this.state = {
      editorState: EditorState.createEmpty(),
      initialStateSet: false,
    };

    // set bindings
    this.onEditorStateChange.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    // load eventually existing draft
    const nextState = getEditorState(nextProps.content, this.state.editorState, this.state.initialStateSet);
    if (nextState) {
      this.setState({
        initialStateSet: true,
        editorState: nextState,
      });
    }
  }

  onEditorStateChange = (editorState) => {
    this.setState({
      editorState,
    });

    // store temp draft
    this.props.onEditorChange(convertToRaw(editorState.getCurrentContent()));
  };

  render() {
    const { editorState } = this.state;
    return (
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
    );
  }
}

IdeaEditor.propTypes = {
  onEditorChange: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  ideasNewPageState: selectSubmitIdea,
});

const mergeProps = ({ ideasNewPageState: pageState }) => ({
  content: getFromState(pageState, 'draft', 'content'),
});

export default styled(connect(mapStateToProps, null, mergeProps)(IdeaEditor))`
  // none yet
`;
