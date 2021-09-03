import React from 'react';
import { Select, SelectProps } from 'cl2-component-library';
import { FieldProps } from 'formik';
import { IOption } from 'typings';

interface State {}

class FormikInput extends React.Component<FieldProps & SelectProps, State> {
  handleOnChange = (newOption: IOption) => {
    this.props.form.setFieldValue(this.props.field.name, newOption.value);
  };

  render() {
    const { value } = this.props.field;
    return (
      <Select {...this.props} value={value} onChange={this.handleOnChange} />
    );
  }
}

export default FormikInput;
