import * as React from 'react';
import styledComponents from 'styled-components';
const styled = styledComponents;
// import Icon from 'components/Icon';
import Error from 'components/UI/Error';
import { EditorState } from 'draft-js';
import { Editor as DraftEditor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import * as _ from 'lodash';

const Container = styled.div``;

interface DraftProps {
  error?: boolean;
  focussed?: boolean;
}

const DraftEditorContainer = styled.div`
  width: 100%;
  border-radius: 5px;
  border: solid 1px;
  /* overflow: hidden; */
  border-color: ${(props: DraftProps) => {
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
    border-color: ${(props: DraftProps) => {
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
      padding: 14px 10px;
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

  .rdw-editor-main {
    min-height: 230px;
    font-size: 17px;
    line-height: 23px;
    font-weight: 400;
    cursor: text;
    padding: 12px;
    margin: 0px;
    margin-top: 0px;
    background: transparent;
    overflow: visible;

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

interface Props {
  value?: any;
  placeholder?: string;
  error?: string | null;
  toolbarConfig?: any;
  onChange: Function;
}

interface State {
  focussed: boolean;
}

class Editor extends React.Component<Props, State> {
  public static defaultProps: Partial<Props> = {
    value: '',
    placeholder: '',
    error: null,
    toolbarConfig: {
      options: ['inline', 'list', 'link', 'emoji'],
      inline: {
        options: ['bold', 'italic'],
      },
      list: {
        options: ['unordered', 'ordered'],
      },
    },
  };

  constructor() {
    super();
    this.state = { focussed: false };
  }

  handleOnEditorStateChange = (editorState) => {
    this.props.onChange(editorState);
  }

  handleOnFocus = () => {
    this.setState({ focussed: true });
  }

  handleOnBlur = () => {
    this.setState({ focussed: false });
  }

  render() {
    const { value, placeholder, error, toolbarConfig } = this.props;
    const { focussed } = this.state;
    const hasError = (_.isString(error) && !_.isEmpty(error));
    const editorState = (value === null ? EditorState.createEmpty() : value);

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
            mention={{
              separator: ' ',
              trigger: '@',
              caseSensitive: false,
              mentionClassName: 'mention-className',
              dropdownClassName: 'dropdown-className',
              optionClassName: 'option-className',
              suggestions: [
                { text: 'apple', value: 'apple', url: 'apple' },
                { text: 'banana', value: 'banana', url: 'banana' },
                { text: 'cherry', value: 'cherry', url: 'cherry' },
                { text: 'durian', value: 'durian', url: 'durian' },
                { text: 'eggfruit', value: 'eggfruit', url: 'eggfruit' },
                { text: 'fig', value: 'fig', url: 'fig' },
                { text: 'grapefruit', value: 'grapefruit', url: 'grapefruit' },
                { text: 'honeydew', value: 'honeydew', url: 'honeydew' },
              ],
            }}
          />
        </DraftEditorContainer>
        <Error
          text={error}
          size={null}
          marginTop={null}
          marginBottom={null}
          showIcon={null}
          showBackground={null}
          className={null}
        />
      </Container>
    );
  }
}

export default Editor;
