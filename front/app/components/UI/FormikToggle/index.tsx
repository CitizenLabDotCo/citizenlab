import React from 'react';
import { Toggle } from '@citizenlab/cl2-component-library';
import { FieldProps } from 'formik';

class FormikToggle extends React.PureComponent<FieldProps> {
  handleOnChange = () => {
    const {
      form,
      field: { name, value },
    } = this.props;
    form.setFieldValue(name, !value);
    form.setStatus('enabled');
    form.setFieldTouched(name, true);
    form.setFieldError(name, '');
  };

  render() {
    const { value } = this.props.field;

    return (
      <Toggle {...this.props} checked={value} onChange={this.handleOnChange} />
    );
  }
}

export default FormikToggle;
