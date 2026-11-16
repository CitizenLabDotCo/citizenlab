import React from 'react';

import { Controller } from 'react-hook-form';

import { TFieldName } from 'components/UI/Error';

import MultilocTextField from './MultilocTextField';
import useFormMultilocField from './useFormMultilocField';

interface Props {
  name: TFieldName;
  label: string;
  placeholder?: string;
  maxCharCount?: number;
}

// A MultilocTextField bound to the surrounding react-hook-form form.
const FormMultilocTextField = ({
  name,
  label,
  placeholder,
  maxCharCount,
}: Props) => {
  const { control, emptyMultiloc, errorMessage } = useFormMultilocField(name);

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={emptyMultiloc}
      render={({ field }) => (
        <MultilocTextField
          id={name}
          label={label}
          placeholder={placeholder}
          valueMultiloc={{ ...emptyMultiloc, ...field.value }}
          onChange={field.onChange}
          onBlur={field.onBlur}
          inputRef={field.ref}
          errorMessage={errorMessage}
          maxCharCount={maxCharCount}
        />
      )}
    />
  );
};

export default FormMultilocTextField;
