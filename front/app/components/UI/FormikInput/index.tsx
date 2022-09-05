import React from 'react';
import { Input, InputProps } from '@citizenlab/cl2-component-library';
import { FieldProps } from 'formik';
import { Locale } from 'typings';

const FormikInput = ({
  form: { setFieldValue, setStatus, setFieldTouched, setFieldError },
  field: { name, value },
  ...props
}: FieldProps & InputProps) => {
  const handleOnChange = (newValue: string, _locale: Locale | undefined) => {
    setFieldValue(name, newValue);
    setStatus('enabled');
    setFieldTouched(name, true);
    setFieldError(name, '');
  };

  return (
    <Input {...props} name={name} value={value} onChange={handleOnChange} />
  );
};

export default FormikInput;
