// Libraries
import React from 'react';

import QuillEditor, { Props as VanillaProps } from 'components/QuillEditor';

// Typings
export interface Props {
  name: string;
}
export interface State {}

class FormikEditor extends React.Component<Props & VanillaProps, State> {
  handleOnChange(html: string) {
    this.context.formik.setFieldValue(this.props.name, html);
  }

  handleOnBlur = () => {
    this.context.formik.setFieldTouched(this.props.name);
  }

  render() {
    const { name, ...otherProps } = this.props;
    return (
      <QuillEditor
        {... otherProps}
        onChange={this.handleOnChange}
        value={this.context.formik.values[name] || ''}
        onBlur={this.handleOnBlur}
      />
    );
  }
}

export default FormikEditor;
