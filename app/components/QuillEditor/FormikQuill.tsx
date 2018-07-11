// Libraries
import React from 'react';
import { FieldProps } from 'formik';

import QuillEditor, { Props as VanillaProps } from 'components/QuillEditor';

class FormikEditor extends React.Component<FieldProps & VanillaProps> {
  handleOnChange(html: string) {
    this.props.form.setFieldValue(this.props.field.name, html);
  }

  handleOnBlur = () => {
    this.props.form.setFieldTouched(this.props.field.name);
  }

  render() {
        const { value } = this.props.field;
    return (
      <QuillEditor
        {... this.props}
        onChange={this.handleOnChange}
        value={value || ''}
        onBlur={this.handleOnBlur}
      />
    );
  }
}

export default FormikEditor;
