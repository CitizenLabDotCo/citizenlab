import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
// components
import FormComponent from 'components/forms/formComponent';
import { Form } from 'semantic-ui-react';
import RtfEditor from 'components/forms/inputs/rtfEditor';
import Button from 'components/UI/Button';

// messages
import messages from '../../messages';

class EditorForm extends FormComponent {
  constructor(props) {
    super(props);
    this.values = { ideaId: props.ideaId, parentId: props.parentId };
  }

  handleSuccess = () => {
    this.props.onSuccess();
  }

  /* eslint-disable react/jsx-boolean-value*/
  render() {
    const { loading } = this.state;
    const { errors, error } = this.state;
    return (
      <Form error={error} onSubmit={this.handleSubmit}>
        {/* TODO #later: customize toolbar and set up desired functions (image etc.)
            based on https://github.com/jpuri/react-draft-wysiwyg/blob/master/docs/src/components/Demo/index.js */}
        <RtfEditor name={'comment'} action={this.handleChange} errors={errors.text} label={messages.commentEditorLabel} />
        <Button
          onClick={this.handleClick}
          loading={loading}
        >
          <FormattedMessage {...messages.publishComment} />
        </Button>
      </Form>
    );
  }
}

EditorForm.propTypes = {
  parentId: PropTypes.string,
  ideaId: PropTypes.string.isRequired,
};

export default EditorForm;
