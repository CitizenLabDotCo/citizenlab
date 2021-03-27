import React from 'react';
import TextAreaMultilocWithLocaleSwitcher, {
  Props,
} from 'components/UI/TextAreaMultilocWithLocaleSwitcher';
import { FieldProps } from 'formik';

class FormikTextAreaMultilocWithLocaleSwitcher extends React.Component<
  FieldProps & Props
> {
  handleOnChange = (newValue) => {
    this.props.form.setFieldTouched(this.props.field.name);
    this.props.form.setFieldValue(this.props.field.name, newValue);
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
