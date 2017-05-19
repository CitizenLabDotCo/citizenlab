import React from 'react';
import PropTypes from 'prop-types';
import { EditorState, convertToRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import draftToHtml from 'draftjs-to-html';

import { getEditorState } from './editorState';
import { selectSubmitIdea } from '../selectors';
import { saveDraft } from '../actions';

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
    const rawContent = convertToRaw(editorState.getCurrentContent());
    this.props.storeDraftCopy(rawContent);
  };

  render() {
    const { editorState } = this.state;
    return (
      <div className={this.props.className}>
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
  storeDraftCopy: PropTypes.func.isRequired,
  className: PropTypes.string,
};

const mapStateToProps = createStructuredSelector({
  ideasNewPageState: selectSubmitIdea,
});

const mapDispatchToProps = (dispatch) => ({
  storeDraftCopy(content) {
    // convert to HTML
    const htmlContent = draftToHtml(content);

    dispatch(saveDraft(htmlContent));
  },
});

const mergeProps = ({ ideasNewPageState: pageState }, { storeDraftCopy }) => ({
  content: pageState.getIn(['draft', 'content']),
  storeDraftCopy,
});

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(styled(IdeaEditor)`
  height: 550px;
  border-radius: 3px;
  background-color: #ffffff;
  box-shadow: 0 4px 8px 0 rgba(81, 96, 115, 0.18);
`);
