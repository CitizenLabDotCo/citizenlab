import * as React from 'react';
import InputMultiloc, { Props as VanillaInputMultilocProps } from 'components/UI/InputMultiloc';
import { FieldProps } from 'formik';

class FormikInputMultiloc extends React.Component<FieldProps & VanillaInputMultilocProps> {

  handleOnChange = (newValue) => {
    this.props.form.setFieldValue(this.props.field.name, newValue);
  }

  render() {
    const { value, onBlur } = this.props.field;
    return (
      <InputMultiloc
        {...this.props}
        valueMultiloc={value}
        onChange={this.handleOnChange}
        onBlur={onBlur}
      />
    );
  }
}

export default FormikInputMultiloc;
