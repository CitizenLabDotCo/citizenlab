import React, { memo } from 'react';
import TextAreaMultilocWithLocaleSwitcher from 'components/UI/TextAreaMultilocWithLocaleSwitcher';

const FormikTextAreaMultilocWithLocaleSwitcher = memo<Props>((props) => {
  const handleOnChange = (newValue) => {
    props.form.setFieldTouched(props.field.name);
    props.form.setFieldValue(props.field.name, newValue);
  };

  const { value } = props.field;
  return (
    <TextAreaMultilocWithLocaleSwitcher
      {...props}
      valueMultiloc={value}
      onChange={handleOnChange}
    />
  );
});

export default FormikTextAreaMultilocWithLocaleSwitcher;
