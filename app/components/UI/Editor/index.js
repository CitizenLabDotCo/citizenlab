import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Icon from 'components/Icon';
import Error from 'components/UI/Error';
import { EditorState, convertToRaw } from 'draft-js';
import { Editor as DraftEditor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import draftToHtml from 'draftjs-to-html';
import _ from 'lodash';

const Container = styled.div``;

const DraftEditorContainer = styled.div`
  width: 100%;
  border-radius: 5px;
  border: solid 1px;
  overflow: hidden;
  border-color: ${(props) => {
    if (props.error) {
      return '#fc3c2d';
    } else if (props.focussed) {
      return '#333';
    }

    return '#ccc';
  }};
  background: #fff;
  position: relative;

  &:not(:focus):hover {
    border-color: ${(props) => {
      if (props.error) {
        return '#fc3c2d';
      } else if (props.focussed) {
        return '#000';
      }

      return '#999';
    }};
  }

  .rdw-editor-toolbar {
    width: auto;
    padding: 9px;
    padding-left: 4px;
    margin: 0;
    border-radius: 0px;
    border: none;
    background: #fff;
    border-bottom: solid 1px #f0f0f0;

    .rdw-inline-wrapper,
    .rdw-list-wrapper,
    .rdw-link-wrapper,
    .rdw-option-wrapper {
      margin: 0;
      padding: 0;
      border: none;
    }

    .rdw-option-wrapper {
      padding: 12px 10px;
      margin-right: 3px;
      border-radius: 3px;
      background: transparent;
      opacity: 0.5;

      &.rdw-option-disabled {
        opacity: 0.2;
        cursor: not-allowed;
      }

      &:hover {
        box-shadow: none;

        &:not(.rdw-option-disabled) {
          opacity: 1;
        }
      }

      &.rdw-option-active {
        box-shadow: none;
        opacity: 1;
      }
    }
  }

  .rdw-editor-main {
    min-height: 210px;
    font-size: 17px;
    line-height: 23px;
    font-weight: 300;
    cursor: text;
    padding: 12px;
    margin: 0px;
    margin-top: 0px;
    background: transparent;

    .public-DraftStyleDefault-block {
      font-size: 17px;
      line-height: 23px;
      margin: 0px;
    }
  }
`;

const IconWrapper = styled.div`
  width: 22px;
  position: absolute;
  top: 9px;
  right: 13px;
  z-index: 1;

  svg  {
    fill: red;
  }
`;

class Editor extends React.PureComponent {
  constructor() {
    super();
    this.state = { focussed: false };
  }

  handleOnEditorStateChange = (editorState) => {
    this.props.onChange(editorState);
  };

  handleOnFocus = () => {
    this.setState({ focussed: true });
  };

  handleOnBlur = () => {
    this.setState({ focussed: false });
  }

  render() {
    const { value, placeholder, error, toolbarConfig } = this.props;
    const { focussed } = this.state;
    const hasError = (_.isString(error) && !_.isEmpty(error));
    const editorState = (value !== null ? draftToHtml(convertToRaw(value.getCurrentContent())) : EditorState.createEmpty());

    return (
      <Container>
        <DraftEditorContainer focussed={focussed} error={hasError}>
          <DraftEditor
            editorState={editorState}
            placeholder={placeholder}
            onEditorStateChange={this.handleOnEditorStateChange}
            toolbar={toolbarConfig}
            onFocus={this.handleOnFocus}
            onBlur={this.handleOnBlur}
          />
          { hasError && <IconWrapper><Icon name="error" /></IconWrapper> }
        </DraftEditorContainer>
        <Error text={error} />
      </Container>
    );
  }
}

Editor.propTypes = {
  value: PropTypes.any,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  toolbarConfig: PropTypes.object,
  onChange: PropTypes.func,
};

Editor.defaultProps = {
  value: '',
  placeholder: '',
  error: null,
  toolbarConfig: {
    options: ['inline', 'list', 'link'],
    inline: {
      options: ['bold', 'italic'],
    },
    list: {
      options: ['unordered', 'ordered'],
    },
  },
};

export default Editor;
