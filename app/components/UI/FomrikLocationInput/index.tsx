import React, { PureComponent } from 'react';
import { LocationInput, LocationInputProps } from 'cl2-component-library';
import { FieldProps } from 'formik';

class FormikLocationInput extends PureComponent<FieldProps & LocationInputProps> {
  handleOnChange = (newValue) => {
    this.props.form.setFieldValue(this.props.field.name, newValue);
  }

  handleOnBlur = () => {
    this.props.form.setFieldTouched(this.props.field.name, true);
  }

  render() {
    const { value } = this.props.field;
    return (
      <LocationInput
        {...this.props}
        value={value}
        onChange={this.handleOnChange}
        onBlur={this.handleOnBlur}
      />
    );
  }
}

export default FormikLocationInput;
