import React from 'react';
import { FieldProps } from 'formik';

// components
import QuillMultilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';

// typings
import { Multiloc } from 'typings';

interface Props {
  id: string;
  valueMultiloc: Multiloc | null | undefined;
  labelTooltipText?: string | JSX.Element | null;
  label?: string | JSX.Element | null;
  withCTAButton?: boolean;
}

const FormikQuillMultiloc = ({
  form: { setFieldError, setFieldTouched, setFieldValue, setStatus },
  field: { value, name },
  ...props
}: FieldProps & Props) => {
  const handleOnChange = (newValue: Multiloc) => {
    setFieldValue(name, newValue);
    setStatus('enabled');
    setFieldTouched(name, true);
    setFieldError(name, '');
  };

  return (
    <QuillMultilocWithLocaleSwitcher
      {...props}
      valueMultiloc={value}
      onChange={handleOnChange}
    />
  );
};

export default FormikQuillMultiloc;
