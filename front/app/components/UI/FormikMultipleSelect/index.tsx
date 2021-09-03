import React from 'react';
import MultipleSelect, {
  Props as VanillaInputProps,
} from 'components/UI/MultipleSelect';
import { FieldProps } from 'formik';
import { IOption } from 'typings';

interface State {}

class FormikMultipleSelect extends React.Component<
  FieldProps & VanillaInputProps,
  State
> {
  handleOnChange = (newOption: IOption[]) => {
    this.props.form.setFieldValue(
      this.props.field.name,
      newOption.map((o) => o.value)
    );
  };

  render() {
    const { value } = this.props.field;
    return (
      <MultipleSelect
        {...this.props}
        value={value}
        onChange={this.handleOnChange}
      />
    );
  }
}

export default FormikMultipleSelect;
