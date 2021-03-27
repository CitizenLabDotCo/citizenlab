import React from 'react';
import { Toggle } from 'cl2-component-library';
import { FieldProps } from 'formik';

class FormikToggle extends React.PureComponent<FieldProps> {
  handleOnChange = () => {
    this.props.form.setFieldValue(
      this.props.field.name,
      !this.props.field.value
    );
  };

  render() {
    const { value } = this.props.field;

    return (
      <Toggle {...this.props} checked={value} onChange={this.handleOnChange} />
    );
  }
}

export default FormikToggle;
