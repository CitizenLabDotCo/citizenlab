import React, { PureComponent } from 'react';
import MentionsTextArea, { InputProps } from 'components/UI/MentionsTextArea';
import { FieldProps } from 'formik';

class FormikMentionsTextArea extends PureComponent<FieldProps & InputProps> {
  handleOnChange = (newValue) => {
    this.props.form.setFieldValue(this.props.field.name, newValue);
  };

  handleOnBlur = () => {
    this.props.form.setFieldTouched(this.props.field.name, true);
  };

  render() {
    const { value } = this.props.field;
    return (
      <MentionsTextArea
        {...this.props}
        value={value}
        onChange={this.handleOnChange}
        onBlur={this.handleOnBlur}
      />
    );
  }
}

export default FormikMentionsTextArea;
