import React from 'react';
import InputMultilocWithLocaleSwitcher, {
  Props as InputMultilocProps,
} from 'components/UI/InputMultilocWithLocaleSwitcher';
import { FieldProps } from 'formik';

interface Props
  extends Omit<InputMultilocProps, 'valueMultiloc' | 'type'>,
    FieldProps {}

const FormikInputMultilocWithLocaleSwitcher = ({
  form: { setFieldValue, setFieldTouched, setFieldError, setStatus },
  field: { name, value },
  ...props
}: Props) => {
  const handleOnChange = (newValue) => {
    setFieldValue(name, newValue);
    setStatus('enabled');
    setFieldTouched(name, true);
    setFieldError(name, '');
  };

  return (
    <InputMultilocWithLocaleSwitcher
      {...props}
      type="text"
      valueMultiloc={value}
      onChange={handleOnChange}
    />
  );
};

export default FormikInputMultilocWithLocaleSwitcher;
