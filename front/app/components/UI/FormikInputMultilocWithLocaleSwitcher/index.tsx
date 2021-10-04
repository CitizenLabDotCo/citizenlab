import React from 'react';
import InputMultilocWithLocaleSwitcher, {
  Props as InputMultilocProps,
} from 'components/UI/InputMultilocWithLocaleSwitcher';
import { FieldProps } from 'formik';

const FormikInputMultilocWithLocaleSwitcher = (
  props: FieldProps & InputMultilocProps
) => {
  const handleOnChange = (newValue) => {
    props.form.setFieldValue(props.field.name, newValue);
    props.form.setStatus('enabled');
    props.form.setFieldTouched(props.field.name, true);
  };

  return (
    <InputMultilocWithLocaleSwitcher
      {...props}
      valueMultiloc={props.field.value}
      onChange={handleOnChange}
    />
  );
};

export default FormikInputMultilocWithLocaleSwitcher;
