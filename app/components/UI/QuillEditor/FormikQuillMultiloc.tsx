// Libraries
import React, { PureComponent } from 'react';
import { FieldProps } from 'formik';

// components
import QuillMultiloc, { MultilocEditorProps } from 'components/UI/QuillEditor/QuillMultiloc';

// typings

export default class FormikQuillMultiloc extends PureComponent<FieldProps & MultilocEditorProps> {

  handleOnChange = (newValue) => {
    this.props.form.setFieldValue(this.props.field.name, newValue);
    this.props.form.setStatus('enabled');
  }
  handleOnBlur = () => {
    this.props.form.setFieldTouched(this.props.field.name);
  }

  render() {
    const { value } = this.props.field;
    return (
      <QuillMultiloc
        {...this.props}
        id={this.props.field.name}
        valueMultiloc={value}
        onChangeMultiloc={this.handleOnChange}
        onBlur={this.handleOnBlur}
      />
    );
  }
}
