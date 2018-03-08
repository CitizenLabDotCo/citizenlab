import * as React from 'react';
import Toggle, { Props as VanillaToggleProps } from 'components/UI/Toggle';
import { FieldProps } from 'formik';

class FormikToggle extends React.Component<FieldProps & VanillaToggleProps> {

  handleOnChange = () => {
    this.props.form.setFieldValue(this.props.field.name, !this.props.field.value);
  }

  render() {
    const { value } = this.props.field;
    return (
      <Toggle
        {...this.props}
        checked={value}
        onToggle={this.handleOnChange}
      />
    );
  }
}

export default FormikToggle;
