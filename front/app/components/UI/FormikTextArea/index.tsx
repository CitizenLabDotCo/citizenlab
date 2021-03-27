// Libraries
import React from 'react';
import { FormikConsumer, FormikContext } from 'formik';
import Textarea, { Props as VanillaProps } from 'components/UI/TextArea';

// Typings
export interface Props {
  name: string;
}

export interface State {}

class FormikTextArea extends React.Component<Props & VanillaProps, State> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handleOnChange = (formikContext: FormikContext<any>) => (value: string) => {
    formikContext.setFieldValue(this.props.name, value);
  };

  render() {
    return (
      <FormikConsumer>
        {(formikContext) => (
          <Textarea
            {...this.props}
            value={formikContext.values[this.props.name] || ''}
            onChange={this.handleOnChange(formikContext)}
          />
        )}
      </FormikConsumer>
    );
  }
}

export default FormikTextArea;
