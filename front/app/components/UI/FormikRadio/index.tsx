// Libraries
import React, { PureComponent } from 'react';
import { FormikConsumer, FormikContext } from 'formik';
import { Radio, RadioProps } from '@citizenlab/cl2-component-library';

// Typings
type Props = RadioProps & {
  name: string;
};

class FormikRadio extends PureComponent<Props> {
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
