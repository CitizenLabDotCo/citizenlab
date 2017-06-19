import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Editor as DraftEditor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

const Container = styled.div`
  width: 100%;
  border-radius: 5px;
  border: solid 1px;
  overflow: hidden;
  border-color: ${(props) => props.focussed ? '#333' : '#ccc'};
  background: #fff;

  &:not(:focus):hover {
    border-color: ${(props) => props.focussed ? '#000' : '#999'};
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
    min-height: 250px;
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
    return (
      <Container focussed={this.state.focussed}>
        <DraftEditor
          editorState={this.props.value}
          placeholder={this.props.placeholder}
          onEditorStateChange={this.handleOnEditorStateChange}
          toolbar={this.props.toolbarConfig}
          onFocus={this.handleOnFocus}
          onBlur={this.handleOnBlur}
        />
      </Container>
    );
  }
}

Editor.propTypes = {
  value: PropTypes.any.isRequired,
  placeholder: PropTypes.string.isRequired,
  toolbarConfig: PropTypes.any.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default Editor;
