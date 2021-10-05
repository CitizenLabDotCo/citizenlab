import React from 'react';
import InputMultilocWithLocaleSwitcher, {
  Props as InputMultilocProps,
} from 'components/UI/InputMultilocWithLocaleSwitcher';
import { FieldProps } from 'formik';

const FormikInputMultilocWithLocaleSwitcher = ({
  form: { setFieldValue, setFieldTouched, setFieldError, setStatus },
  field: { name, value },
  ...props
}: FieldProps & InputMultilocProps) => {
  const handleOnChange = (newValue) => {
    setFieldValue(name, newValue);
    setStatus('enabled');
    setFieldTouched(name, true);
    setFieldError(name, '');
  };

  return (
    <InputMultilocWithLocaleSwitcher
      {...props}
      valueMultiloc={value}
      onChange={handleOnChange}
    />
  );
};

export default FormikInputMultilocWithLocaleSwitcher;
