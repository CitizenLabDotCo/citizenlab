import * as React from 'react';
import InputMultiloc, { Props as VanillaInputMultilocProps } from 'components/UI/InputMultiloc';
import { FieldProps } from 'formik';

class FormikInputMultiloc extends React.Component<FieldProps & VanillaInputMultilocProps> {

  handleOnChange = (newValue) => {
    this.props.form.setFieldValue(this.props.field.name, newValue);
  }

  handleOnBlur = () => {
    this.props.form.setFieldTouched(this.props.field.name, true);
  }

  render() {
    const { value } = this.props.field;
    return (
      <InputMultiloc
        {...this.props}
        valueMultiloc={value}
        onChange={this.handleOnChange}
        onBlur={this.handleOnBlur}
      />
    );
  }
}

export default FormikInputMultiloc;
