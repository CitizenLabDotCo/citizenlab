import React from 'react';
import {
  ColorPickerInput,
  ColorPickerInputProps as VanillaInputProps,
} from 'cl2-component-library';
import { FieldProps } from 'formik';

interface State {}

class FormikColorPickerInput extends React.Component<
  FieldProps & VanillaInputProps,
  State
> {
  handleOnChange = (newValue) => {
    this.props.form.setFieldValue(this.props.field.name, newValue);
  };

  render() {
    const { value } = this.props.field;
    return (
      <ColorPickerInput
        {...this.props}
        value={value}
        onChange={this.handleOnChange}
      />
    );
  }
}

export default FormikColorPickerInput;
