import React from 'react';
import TextAreaMultilocWithLocaleSwitcher, {
  Props,
} from 'components/UI/TextAreaMultilocWithLocaleSwitcher';
import { FieldProps } from 'formik';

class FormikTextAreaMultilocWithLocaleSwitcher extends React.Component<
  FieldProps & Props
> {
  handleOnChange = (newValue) => {
    this.props.form.setFieldValue(this.props.field.name, newValue);
    this.props.form.setStatus('enabled');
    this.props.form.setFieldTouched(this.props.field.name, true);
  };

  render() {
    const { value } = this.props.field;
    return (
      <TextAreaMultilocWithLocaleSwitcher
        {...this.props}
        valueMultiloc={value}
        onChange={this.handleOnChange}
      />
    );
  }
}

export default FormikTextAreaMultilocWithLocaleSwitcher;
