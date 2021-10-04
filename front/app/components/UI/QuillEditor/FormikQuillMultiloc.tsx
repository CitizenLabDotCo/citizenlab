import React, { PureComponent } from 'react';
import { FieldProps } from 'formik';

// components
import QuillMultilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';

// typings
import { Multiloc } from 'typings';

interface Props {
  id: string;
  valueMultiloc: Multiloc | null | undefined;
  labelTooltipText?: string | JSX.Element | null;
  label?: string | JSX.Element | null;
  withCTAButton?: boolean;
}

export default class FormikQuillMultiloc extends PureComponent<
  FieldProps & Props
> {
  handleOnChange = (newValue: Multiloc) => {
    this.props.form.setFieldValue(this.props.field.name, newValue);
    this.props.form.setStatus('enabled');
    this.props.form.setFieldTouched(this.props.field.name);
  };

  render() {
    const { field } = this.props;
    return (
      <QuillMultilocWithLocaleSwitcher
        {...this.props}
        valueMultiloc={field.value}
        onChange={this.handleOnChange}
      />
    );
  }
}
