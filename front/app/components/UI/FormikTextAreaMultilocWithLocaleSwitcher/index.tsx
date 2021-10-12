import React from 'react';
import TextAreaMultilocWithLocaleSwitcher, {
  Props,
} from 'components/UI/TextAreaMultilocWithLocaleSwitcher';
import { FieldProps } from 'formik';

const FormikTextAreaMultilocWithLocaleSwitcher = ({
  form: { setFieldValue, setStatus, setFieldTouched, setFieldError },
  field: { value, name },
  ...props
}: FieldProps & Props) => {
  const handleOnChange = (newValue) => {
    setFieldValue(name, newValue);
    setStatus('enabled');
    setFieldTouched(name, true);
    setFieldError(name, '');
  };

  return (
    <TextAreaMultilocWithLocaleSwitcher
      {...props}
      valueMultiloc={value}
      onChange={handleOnChange}
    />
  );
};

export default FormikTextAreaMultilocWithLocaleSwitcher;
