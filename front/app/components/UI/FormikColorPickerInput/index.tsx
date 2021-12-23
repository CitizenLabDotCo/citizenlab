import React from 'react';
import {
  ColorPickerInput,
  ColorPickerInputProps as VanillaInputProps,
} from '@citizenlab/cl2-component-library';
import { FieldProps } from 'formik';

interface State {}

class FormikColorPickerInput extends React.Component<
  FieldProps & VanillaInputProps,
  State
> {
  handleOnChange = (newValue) => {
    const {
      form,
      field: { name },
    } = this.props;
    form.setFieldValue(name, newValue);
    form.setStatus('enabled');
    form.setFieldTouched(name, true);
    form.setFieldError(name, '');
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
