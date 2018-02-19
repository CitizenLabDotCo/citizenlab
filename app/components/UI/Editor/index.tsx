import * as React from 'react';
import { isNil, isEmpty } from 'lodash';
import Error from 'components/UI/Error';
import { EditorState } from 'draft-js';
import { Editor as DraftEditor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import styled from 'styled-components';

const Container = styled.div``;

const DraftEditorContainer: any = styled.div`
  width: 100%;
  border-radius: 5px;
  border: solid 1px;
  border-color: ${(props: any) => {
    if (props.error) {
      return '#fc3c2d';
    }

    return '#ccc';
  }};
  background: #fff;
  position: relative;

  .rdw-editor-toolbar {
    width: auto;
    padding: 7px;
    padding-left: 6px;
    margin: 0;
    border-radius: 0px;
    border: none;
    background: transparent;
    border-bottom: solid 1px #e0e0e0;

    .rdw-emoji-modal,
    .rdw-link-modal {
      box-shadow: none;
      border: solid 1px #666;
      border-radius: 3px;
      top: 30px;
    }

    .rdw-link-modal {
      min-height: 215px;
    }

    > div {
      margin: 0;
      padding: 0;
      border: none;
    }

    .rdw-option-wrapper {
      padding: 5px 5px;
      margin-right: 3px;
      border: solid 1px transparent;
      border-radius: 3px;
      background: transparent;
      opacity: 1;

      &.rdw-option-disabled {
        opacity: 0.2;
        cursor: not-allowed;
      }

      &:hover {
        box-shadow: none;

        &:not(.rdw-option-disabled) {
          border-color: #ccc;
        }
      }

      &.rdw-option-active {
        box-shadow: none;
        background: #f0f0f0;
        border-color: #ccc;
      }
    }
  }

  .DraftEditor-editorContainer {
    z-index: auto !important;
  }

  .rdw-editor-main {
    min-height: 250px;
    font-size: 17px;
    line-height: 23px;
    font-weight: 400;
    cursor: text;
    padding: 12px;
    margin: 0px;
    margin-top: 0px;
    background: transparent;
    overflow: visible;
    z-index: 0;

    .public-DraftEditorPlaceholder-root {
      color: #aaa;
      margin: 0px;
    }

    .public-DraftStyleDefault-block {
      margin: 0px;
    }

    .rdw-suggestion-dropdown {
      box-shadow: none;
      border: solid 1px #666;
      border-radius: 3px;
      position: absolute;
      z-index: 9999;

      .rdw-suggestion-option {
        padding: 8px 12px;
        margin: 0;
        border-color: #e0e0e0;
        cursor: pointer;

        &:last-child {
          border: none;
        }
      }
    }

    .rdw-mention-link {
      cursor: pointer;
    }
  }
`;

type Props = {
  id?: string | undefined;
  value?: EditorState | null | undefined;
  placeholder?: string | JSX.Element | null | undefined;
  error?: string | JSX.Element | null | undefined;
  toolbarConfig?: {} | null | undefined;
  onChange: (arg: EditorState) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  setRef?: (arg: HTMLInputElement) => void | undefined;
};

type State = {
  focussed: boolean;
};

export default class Editor extends React.PureComponent<Props, State> {
  emptyEditorState: EditorState;

  constructor(props: Props) {
    super(props as any);
    this.state = { focussed: false };
    this.emptyEditorState = EditorState.createEmpty();
  }

  handleOnEditorStateChange = (editorState: EditorState) => {
    this.props.onChange(editorState);
  }

  handleOnFocus = () => {
    this.setState({ focussed: true });

    if (this.props.onFocus) {
      this.props.onFocus();
    }
  }

  handleOnBlur = () => {
    this.setState({ focussed: false });

    if (this.props.onBlur) {
      this.props.onBlur();
    }
  }

  handleRef = (element: HTMLInputElement) => {
    if (this.props.setRef) {
      this.props.setRef(element);
    }
  }

  render() {
    let { value, placeholder, error, toolbarConfig } = this.props;
    const { id } = this.props;
    const { focussed } = this.state;
    const hasError = (!isNil(error) && !isEmpty(error));

    value = (value || this.emptyEditorState);
    placeholder = (placeholder || '');
    error = (error || null);
    toolbarConfig = (toolbarConfig || {
      options: ['inline', 'list', 'link'],
      inline: {
        options: ['bold', 'italic'],
      },
      list: {
        options: ['unordered', 'ordered'],
      },
    });

    return (
      <Container className="editor">
        <DraftEditorContainer focussed={focussed} error={hasError}>
          <DraftEditor
            editorClassName={`draft-editor ${focussed ? 'focus' : ''}`}
            wrapperClassName={`draft-editor-wrapper`}
            id={id}
            spellCheck={true}
            editorState={value}
            placeholder={placeholder}
            onEditorStateChange={this.handleOnEditorStateChange}
            toolbar={toolbarConfig}
            onFocus={this.handleOnFocus}
            onBlur={this.handleOnBlur}
            ref={this.handleRef}
          />
        </DraftEditorContainer>
        <Error text={error}/>
      </Container>
    );
  }
}
