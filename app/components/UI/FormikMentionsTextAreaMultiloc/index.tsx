import React, { PureComponent } from 'react';
import MentionsTextAreaMultiloc, {
  InputProps as MentionsTextAreaMultilocInputProps,
} from 'components/UI/MentionsTextAreaMultiloc';
import { FieldProps } from 'formik';

class FormikMentionsTextAreaMultiloc extends PureComponent<
  FieldProps & MentionsTextAreaMultilocInputProps
> {
  handleOnChange = (newValue) => {
    this.props.form.setFieldValue(this.props.field.name, newValue);
  };

  handleOnBlur = () => {
    this.props.form.setFieldTouched(this.props.field.name, true);
  };

  render() {
    const { value } = this.props.field;
    return (
      <MentionsTextAreaMultiloc
        {...this.props}
        valueMultiloc={value}
        onChange={this.handleOnChange}
        onBlur={this.handleOnBlur}
      />
    );
  }
}

export default FormikMentionsTextAreaMultiloc;
