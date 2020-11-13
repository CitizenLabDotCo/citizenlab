import React, { memo } from 'react';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

const FormikInputMultilocWithLocaleSwitcher = memo<Props>((props) => {
  const handleOnChange = (newValue) => {
    props.form.setFieldTouched(props.field.name);
    props.form.setFieldValue(props.field.name, newValue);
  };

  const { value } = props.field;
  return (
    <InputMultilocWithLocaleSwitcher
      {...props}
      valueMultiloc={value}
      onChange={handleOnChange}
    />
  );
});

export default FormikInputMultilocWithLocaleSwitcher;
