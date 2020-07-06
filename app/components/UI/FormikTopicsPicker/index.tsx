import React from 'react';
import TopicsPicker, { InputProps as VanillaTopicsPickerProps } from 'components/UI/TopicsPicker';
import { FieldProps } from 'formik';

type State = {};

class FormikTopicsPicker extends React.Component<FieldProps & VanillaTopicsPickerProps, State> {

  handleOnChange = (newValue) => {
    this.props.form.setFieldValue(this.props.field.name, newValue);
  }

  render() {
    const { value } = this.props.field;
    return (
      <TopicsPicker
        {...this.props}
        value={value}
        onChange={this.handleOnChange}
      />
    );
  }
}

export default FormikTopicsPicker;
