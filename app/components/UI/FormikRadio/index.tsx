// Libraries
import React from 'react';
import { FormikConsumer, FormikContext } from 'formik';
import Radio, { Props as VanillaProps } from 'components/UI/Radio';

// Typings
export interface Props {
  name: string;
}
export interface State {}

class FormikRadio extends React.Component<Props & VanillaProps, State> {

  constructor(props) {
    super(props);
    this.state = {};
  }

  handleOnChange = (formikContext: FormikContext<any>) => (value: string) => {
    formikContext.setFieldValue(this.props.name, value);
  }

  render() {
    return (
      <FormikConsumer>
        {formikContext => (
          <Radio
            {...this.props}
            currentValue={formikContext.values[this.props.name] || ''}
            onChange={this.handleOnChange(formikContext)}
          />
        )}
      </FormikConsumer>
    );
  }
}

export default FormikRadio;
