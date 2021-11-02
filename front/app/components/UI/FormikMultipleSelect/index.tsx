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
    const {
      form,
      field: { name },
    } = this.props;
    form.setFieldValue(
      name,
      newOption.map((o) => o.value)
    );
    form.setStatus('enabled');
    form.setFieldTouched(name, true);
    form.setFieldError(name, '');
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
