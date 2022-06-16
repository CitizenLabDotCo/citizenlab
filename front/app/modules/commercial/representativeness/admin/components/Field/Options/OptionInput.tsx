import React from 'react';
import { Field } from 'formik';

// components
import { Text, Input } from '@citizenlab/cl2-component-library';

// utils
import { parsePopulationValue } from '../utils';

// typings
import { OptionValue } from '.';

interface FieldProps {
  form: {
    setFieldValue: (field: string, value: OptionValue) => void;
    setStatus: (status: any) => void;
    setFieldTouched: (field: string, isTouched?: boolean) => void;
    setFieldError: (field: string, message: string) => void;
  };
  field: {
    name: string;
    value: OptionValue;
  };
}

const OptionInput = ({
  form: { setFieldValue, setStatus, setFieldTouched, setFieldError },
  field: { name, value },
}: FieldProps) => {
  const handleChange = (stringValue: string) => {
    const population = parsePopulationValue(stringValue);

    if (population !== null) {
      setFieldValue(name, { ...value, population });
      setStatus('enabled');
      setFieldTouched(name, true);
      setFieldError(name, '');
    }
  };

  const { population } = value;

  const formattedPopulation =
    population === undefined ? '' : population.toLocaleString('en-US');

  return (
    <>
      <Input type="text" value={formattedPopulation} onChange={handleChange} />
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
  <Field name={`${optionId}`} component={OptionInput} />
);

export default OptionInputFormikWrapper;
