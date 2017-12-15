import React from 'react';
import PropTypes from 'prop-types';
import { injectTFunc } from 'components/T/utils';

// components
import { Editor as TextBox } from 'react-draft-wysiwyg';
import { Form } from 'semantic-ui-react';
import RenderError from 'components/forms/renderError';

// draft-js
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';

// messages
import { intlShape } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import { appenDableName, toCammelCase } from './utils';
import messages from './messages';

class RtfEditor extends React.Component {
  constructor(props) {
    super();
    this.editorState = this.createEditorState(props);
    this.state = { showError: true };
    const { formatMessage } = props.intl;
    const { name } = props;

    const toAppendName = appenDableName(name);
    const label = formatMessage(props.label || messages[`label${toAppendName}`]);
    this.text = { label };
  }

  componentWillReceiveProps() {
    this.setState({ showError: true });
  }

  createEditorState = ({ initialValue, tFunc }) => {
    if (!initialValue) return EditorState.createEmpty();
    let localInitValue = tFunc(initialValue);
    if (!localInitValue.includes('<p>')) {
      localInitValue = `<p>${localInitValue}</p>`;
    }
    const blocksFromHtml = htmlToDraft(localInitValue);
    const contentBlocks = blocksFromHtml.contentBlocks;
    const contentState = ContentState.createFromBlockArray(contentBlocks);
    return EditorState.createWithContent(contentState);
  }

  handleChange = (editorState) => {
    const { name, intl } = this.props;
    const editorContent = convertToRaw(editorState.getCurrentContent());
    const htmlContent = draftToHtml(editorContent);

    if (htmlContent && htmlContent.trim() !== '<p></p>') {
      const rtfText = {};
      rtfText[intl.locale] = htmlContent;
      this.props.action(name, rtfText);
    }
  };

  render() {
    const { errors } = this.props;
    const { label } = this.text;
    const { showError } = this.state;
    const error = errors && messages[toCammelCase(errors.slice(-1)[0])];

    return (
      <Form.Field>
        <RenderError message={error} showError={showError} />
        <label htmlFor={'textBox'}>{label}</label>
        <div style={{ border: '1px solid black' }}>
          <TextBox
            toolbarHidden
            toolbar={{
              options: ['inline'],
              inline: {
                options: ['bold', 'italic', 'underline'],
              },
            }}
            defaultEditorState={this.editorState}
            onEditorStateChange={this.handleChange}
          />
        </div>
      </Form.Field>
    );
  }
}

RtfEditor.propTypes = {
  name: PropTypes.string.isRequired,
  action: PropTypes.func.isRequired,
  initialValue: PropTypes.object,
  intl: intlShape,
  errors: PropTypes.array,
  label: PropTypes.object,
  tFunc: PropTypes.func,
};

export default injectTFunc(injectIntl(RtfEditor));
