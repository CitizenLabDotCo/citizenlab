// Libraries
import React from 'react';
import { FieldProps } from 'formik';

// components
import QuillMultiloc, { MultilocEditorProps } from 'components/QuillEditor/QuillMultiloc';

// typings

export default class FormikQuillMultiloc extends React.Component<FieldProps & MultilocEditorProps> {

  handleOnChange = (newValue) => {
    this.props.form.setFieldValue(this.props.field.name, newValue);
  }
  handleOnBlur = () => {
    this.props.form.setFieldTouched(this.props.field.name);
  }

  render() {
    const { value } = this.props.field;
    return (
      <QuillMultiloc
        {...this.props}
        valueMultiloc={value}
        onChangeMultiloc={this.handleOnChange}
        onBlur={this.handleOnBlur}
      />
    );
  }
}
