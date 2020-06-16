import React, { PureComponent } from 'react';
import InputMultiloc, { InputProps } from 'components/UI/InputMultiloc';
import { FieldProps } from 'formik';

class FormikInputMultiloc extends PureComponent<FieldProps & InputProps> {
  handleOnChange = (newValue) => {
    this.props.form.setFieldValue(this.props.field.name, newValue);
    this.props.form.setStatus('enabled');
  }

  handleOnBlur = () => {
    this.props.form.setFieldTouched(this.props.field.name, true);
  }

  render() {
    const { value } = this.props.field;

    return (
      <InputMultiloc
        {...this.props}
        valueMultiloc={value}
        onChange={this.handleOnChange}
        onBlur={this.handleOnBlur}
      />
    );
  }
}

export default FormikInputMultiloc;
