import React from 'react';
import { Field } from 'formik';

// components
import FormikToggle from 'components/UI/FormikToggle';

interface Props {
  optionId: string;
}

const OptionToggle = ({ optionId }: Props) => (
  <Field name={`${optionId}.enabled`} component={FormikToggle} />
);

export default OptionToggle;
