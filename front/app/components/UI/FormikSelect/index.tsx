import React from 'react';
import { Select, SelectProps } from '@citizenlab/cl2-component-library';
import { FieldProps } from 'formik';
import { IOption } from 'typings';

interface State {}

class FormikInput extends React.Component<FieldProps & SelectProps, State> {
  handleOnChange = (newOption: IOption) => {
    const {
      form,
      field: { name },
    } = this.props;
    form.setFieldValue(name, newOption.value);
    form.setStatus('enabled');
    form.setFieldTouched(name, true);
    form.setFieldError(name, '');
  };

  render() {
    const { value } = this.props.field;
    return (
      <Select {...this.props} value={value} onChange={this.handleOnChange} />
    );
  }
}

export default FormikInput;
