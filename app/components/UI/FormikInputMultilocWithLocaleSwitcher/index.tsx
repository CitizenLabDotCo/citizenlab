import React, { PureComponent } from 'react';
import InputMultilocWithLocaleSwitcher, {
  Props as InputMultilocProps,
} from 'components/UI/InputMultilocWithLocaleSwitcher';
import { FieldProps } from 'formik';

class FormikInputMultilocWithLocaleSwitcher extends PureComponent<
  FieldProps & InputMultilocProps
> {
  handleOnChange = (newValue) => {
    this.props.form.setFieldValue(this.props.field.name, newValue);
    this.props.form.setStatus('enabled');
  };

  handleOnBlur = () => {
    this.props.form.setFieldTouched(this.props.field.name, true);
  };

  render() {
    const { value } = this.props.field;

    return (
      <InputMultilocWithLocaleSwitcher
        {...this.props}
        valueMultiloc={value}
        onChange={this.handleOnChange}
        onBlur={this.handleOnBlur}
      />
    );
  }
}

export default FormikInputMultilocWithLocaleSwitcher;
