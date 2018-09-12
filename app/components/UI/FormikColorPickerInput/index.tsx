import React from 'react';
import ColorPickerInput, { Props as VanillaInputProps } from 'components/UI/ColorPickerInput';
import { FieldProps } from 'formik';

type State = {};

class FormikColorPickerInput extends React.Component<FieldProps & VanillaInputProps, State> {

  handleOnChange = (newValue) => {
    this.props.form.setFieldValue(this.props.field.name, newValue);
  }

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
