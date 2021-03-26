import React, { PureComponent } from 'react';
import { FieldProps } from 'formik';

// components
import QuillEditor, {
  Props as QuillEditorProps,
} from 'components/UI/QuillEditor';

export default class FormikQuill extends PureComponent<
  FieldProps & QuillEditorProps
> {
  handleOnChange = (newValue: string) => {
    this.props.form.setFieldValue(this.props.field.name, newValue);
    this.props.form.setStatus('enabled');
  };

  handleOnBlur = () => {
    this.props.form.setFieldTouched(this.props.field.name);
  };

  render() {
    const { field } = this.props;

    return (
      <QuillEditor
        {...this.props}
        value={field.value}
        onChange={this.handleOnChange}
        onBlur={this.handleOnBlur}
      />
    );
  }
}
