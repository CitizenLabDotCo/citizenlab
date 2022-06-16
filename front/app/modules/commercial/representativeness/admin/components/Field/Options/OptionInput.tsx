import React from 'react';
import { Field, FieldProps } from 'formik';

// components
import { Text, Input } from '@citizenlab/cl2-component-library';

// utils
import { parsePopulationValue } from '../utils';

const OptionInput = ({
  form: { setFieldValue, setStatus, setFieldTouched, setFieldError },
  field: { name, value },
}: FieldProps) => {
  const handleChange = (stringValue: string) => {
    const newValue = parsePopulationValue(stringValue);

    if (newValue !== null) {
      setFieldValue(name, newValue);
      setStatus('enabled');
      setFieldTouched(name, true);
      setFieldError(name, '');
    }
  };

  const formattedValue =
    value === undefined ? '' : value.toLocaleString('en-US');

  return (
    <>
      <Input type="text" value={formattedValue} onChange={handleChange} />
      <Text ml="16px" mr="24px" color="adminTextColor">
        50%
      </Text>
    </>
  );
};

interface Props {
  optionId: string;
}

const OptionInputFormikWrapper = ({ optionId }: Props) => (
  <Field name={`${optionId}.value`} component={OptionInput} />
);

export default OptionInputFormikWrapper;
