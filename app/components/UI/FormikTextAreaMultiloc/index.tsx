import React from 'react';
import TextAreaMultiloc, { Props } from 'components/UI/TextAreaMultiloc';
import { FieldProps } from 'formik';

class FormikTextAreaMultiloc extends React.Component<FieldProps & Props> {
  handleOnChange = (newValue) => {
    this.props.form.setFieldTouched(this.props.field.name);
    this.props.form.setFieldValue(this.props.field.name, newValue);
  }

  render() {
    const { value } = this.props.field;
    return (
      <TextAreaMultiloc
        {...this.props}
        valueMultiloc={value}
        onChange={this.handleOnChange}
      />
    );
  }
}

export default FormikTextAreaMultiloc;
