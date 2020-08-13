import React, { PureComponent } from 'react';
import { Input, InputProps } from 'cl2-component-library';
import { FieldProps } from 'formik';
import { Locale } from 'typings';

class FormikInput extends PureComponent<FieldProps & InputProps> {
  handleOnChange = (newValue: string, _locale: Locale | undefined) => {
    this.props.form.setFieldValue(this.props.field.name, newValue);
  };

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
