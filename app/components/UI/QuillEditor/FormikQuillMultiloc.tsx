import React, { PureComponent } from 'react';
import { FieldProps } from 'formik';

// components
import QuillMultiloc, {
  InputProps,
} from 'components/UI/QuillEditor/QuillMultiloc';

// typings
import { Multiloc } from 'typings';

export default class FormikQuillMultiloc extends PureComponent<
  FieldProps & InputProps
> {
  handleOnChange = (newValue: Multiloc) => {
    this.props.form.setFieldValue(this.props.field.name, newValue);
    this.props.form.setStatus('enabled');
  };

  handleOnBlur = () => {
    this.props.form.setFieldTouched(this.props.field.name);
  };

  render() {
    const { field } = this.props;

    return (
      <QuillMultiloc
        {...this.props}
        valueMultiloc={field.value}
        onChange={this.handleOnChange}
        onBlur={this.handleOnBlur}
      />
    );
  }
}
