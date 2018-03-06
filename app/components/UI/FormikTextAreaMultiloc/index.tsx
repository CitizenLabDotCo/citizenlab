import * as React from 'react';
import TextAreaMultiloc, { Props as VanillaTextAreaMultilocProps } from 'components/UI/TextAreaMultiloc';
import { FieldProps } from 'formik';

class FormikInputMultiloc extends React.Component<FieldProps & VanillaTextAreaMultilocProps> {

  handleOnChange = (newValue) => {
    this.props.form.setFieldValue(this.props.field.name, newValue);
  }

  render() {
    const { value } = this.props.field;
    return (
      <TextAreaMultiloc
        {...this.props}
        valueMultiloc={value}
        onChange={this.handleOnChange}
      />
    );
  }
}

export default FormikInputMultiloc;
