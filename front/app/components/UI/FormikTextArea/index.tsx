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
    const { name } = this.props;
    formikContext.setFieldValue(name, value);
    formikContext.setStatus('enabled');
    formikContext.setFieldTouched(name, true);
    formikContext.setFieldError(name, '');
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
