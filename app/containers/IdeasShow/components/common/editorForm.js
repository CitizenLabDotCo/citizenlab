import React from 'react';
import PropTypes from 'prop-types';

// components
import FormComponent from 'components/forms/formComponent';
import { Form } from 'semantic-ui-react';
import RtfEditor from 'components/forms/inputs/rtfEditor';
import Button from 'components/buttons/loader';

// messages
import messages from '../../messages';

class EditorForm extends FormComponent {
  constructor(props) {
    super(props);
    this.values = { ideaId: props.ideaId, parentId: props.parentId };
  }

  handleSuccess = () => {
    this.props.onSuccess()
  }

  /* eslint-disable react/jsx-boolean-value*/
  render() {
    const { loading } = this.state;
    const { errors, error } = this.state;
    return (
      <Form error={error} onSubmit={this.handleSubmit}>
        {/* TODO #later: customize toolbar and set up desired functions (image etc.)
            based on https://github.com/jpuri/react-draft-wysiwyg/blob/master/docs/src/components/Demo/index.js */}
        <div style={{ border: '1px solid black' }} />
        <RtfEditor name={'comment'} action={this.handleChange} errors={errors.text} label={messages.commentEditorLabel} />
        <Button
          fluid={true}
          onClick={this.handleClick}
          message={messages.publishComment}
          loading={loading}
        />
      </Form>
    );
  }
}

EditorForm.propTypes = {
  parentId: PropTypes.string,
  ideaId: PropTypes.string.isRequired,
};


export default EditorForm;
