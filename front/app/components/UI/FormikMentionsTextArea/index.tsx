import React, { PureComponent } from 'react';
import MentionsTextArea, { InputProps } from 'components/UI/MentionsTextArea';
import { FieldProps } from 'formik';

class FormikMentionsTextArea extends PureComponent<FieldProps & InputProps> {
  handleOnChange = (newValue) => {
    const { name, form } = this.props;
    form.setFieldValue(name, newValue);
    form.setStatus('enabled');
    form.setFieldTouched(name, true);
    form.setFieldError(name, '');
  };

  render() {
    const { value } = this.props.field;
    return (
      <MentionsTextArea
        {...this.props}
        value={value}
        onChange={this.handleOnChange}
      />
    );
  }
}

export default FormikMentionsTextArea;
