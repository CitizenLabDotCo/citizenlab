import React from 'react';
import Input, { InputProps as VanillaInputProps } from 'components/UI/Input';
import { FieldProps } from 'formik';

type State = {};

class FormikInput extends React.Component<FieldProps & VanillaInputProps, State> {

  handleOnChange = (newValue) => {
    this.props.form.setFieldValue(this.props.field.name, newValue);
  }

  render() {
    const { name, value } = this.props.field;
    return (
      <Input
        {...this.props}
        name={name}
        value={value}
        onChange={this.handleOnChange}
      />
    );
  }
}

export default FormikInput;
