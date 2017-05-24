import React from 'react';
import PropTypes from 'prop-types';

// components
import { Editor as TextBox } from 'react-draft-wysiwyg';
import { Form } from 'semantic-ui-react';
import RenderError from 'components/forms/renderError';

// draft-js
import { EditorState, convertToRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';

// messages
import { injectIntl, intlShape } from 'react-intl';
import { appenDableName, toCammelCase } from './utils';
import messages from '../messages';

class RtfEditor extends React.Component {
  constructor(props) {
    super();
    this.state = { editorState: EditorState.createEmpty(), showError: true };
    const { formatMessage } = props.intl;

    const toAppendName = appenDableName(name);
    const label = formatMessage(messages[`label${toAppendName}`]);
    this.text = { label };
  }

  componentWillReceiveProps() {
    this.setState({ showError: true });
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
    const { showError, editorState } = this.state;
    // if (Object.keys(errors).length !== 0) console.log(errors);
    // const error = errors && messages[toCammelCase(errors.slice(-1)[0])];

    return (
      <Form.Field>
        <RenderError message={error} showError={showError} />
        <label htmlFor={'textBox'}>{label}</label>
        <TextBox
          toolbarHidden
          toolbar={{
            options: ['inline'],
            inline: {
              options: ['bold', 'italic', 'underline'],
            },
          }}
          editorState={editorState}
          onEditorStateChange={this.handleChange}
        />
      </Form.Field>
    );
  }
}

RtfEditor.propTypes = {
  name: PropTypes.string.isRequired,
  action: PropTypes.func.isRequired,
  intl: intlShape,
  errors: PropTypes.array,
};

export default injectIntl(RtfEditor);