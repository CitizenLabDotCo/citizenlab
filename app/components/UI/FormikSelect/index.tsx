import * as React from 'react';
import Select, { Props as VanillaInputProps } from 'components/UI/Select';
import { FieldProps } from 'formik';
import { IOption } from 'typings';


type State = {};

class FormikInput extends React.Component<FieldProps & VanillaInputProps, State> {

  handleOnChange = (newOption: IOption) => {
    this.props.form.setFieldValue(this.props.field.name, newOption.value);
  }

  render() {
    const { value } = this.props.field;
    return (
      <Select
        {...this.props}
        value={value}
        onChange={this.handleOnChange}
      />
    );
  }
}

export default FormikInput;
