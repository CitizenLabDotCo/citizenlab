// Libraries
import React from 'react';
import PropTypes from 'prop-types';

import Textarea, { Props as VanillaProps } from 'components/UI/TextArea';

// Typings
export interface Props {
  name: string;
}
export interface State {}

class FormikTextArea extends React.Component<Props & VanillaProps, State> {
  static contextTypes = {
    formik: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  handleOnChange = (value: string) => {
    this.context.formik.setFieldValue(this.props.name, value);
  }

  render() {
    return (
      <Textarea
        {...this.props}
        value={this.context.formik.values[this.props.name] || ''}
        onChange={this.handleOnChange}
      />
    );
  }
}

export default FormikTextArea;
