// Libraries
import React, { PureComponent } from 'react';
import { FieldProps } from 'formik';

// components
import QuillMultiloc, { InputProps as MultilocEditorProps } from 'components/UI/QuillEditor/QuillMultiloc';

export default class FormikQuillMultiloc extends PureComponent<FieldProps & MultilocEditorProps> {
  handleOnChange = (newValue) => {
    this.props.form.setFieldValue(this.props.field.name, newValue);
    this.props.form.setStatus('enabled');
  }

  handleOnBlur = () => {
    this.props.form.setFieldTouched(this.props.field.name);
  }

  render() {
    const { field: { value, name }, id } = this.props;
    return (
      <QuillMultiloc
        {...this.props}
        id={id ? id : name} // id is not required if there is only one field with the same name on the page.
        valueMultiloc={value}
        onChange={this.handleOnChange}
        onBlur={this.handleOnBlur}
      />
    );
  }
}
