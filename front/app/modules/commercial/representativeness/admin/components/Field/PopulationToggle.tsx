import React from 'react';
import { Field } from 'formik';

// components
import FormikToggle from 'components/UI/FormikToggle';

interface Props {
  optionId: string;
}

const PopulationToggle = ({ optionId }: Props) => (
  <Field name={`${optionId}.enabled`} component={FormikToggle} />
);

export default PopulationToggle;
