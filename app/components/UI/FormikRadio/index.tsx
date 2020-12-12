// Libraries
import React, { PureComponent } from 'react';
import { FormikConsumer, FormikContext } from 'formik';
import { Radio, RadioProps } from 'cl2-component-library';

// Typings
type Props = RadioProps & {
  name: string;
};

class FormikRadio extends PureComponent<Props> {
  handleOnChange = (formikContext: FormikContext<any>) => (value: string) => {
    formikContext.setFieldValue(this.props.name, value);
  };

  render() {
    return (
      <FormikConsumer>
        {(formikContext) => {
          return (
            <Radio
              {...this.props}
              currentValue={formikContext.values[this.props.name]}
              onChange={this.handleOnChange(formikContext)}
            />
          );
        }}
      </FormikConsumer>
    );
  }
}

export default FormikRadio;
