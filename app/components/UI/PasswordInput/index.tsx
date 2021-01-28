import React from 'react';
import { Input, TAutocomplete } from 'cl2-component-library';

interface Props {
  id: string;
  value: string | null;
  error?: string;
  onChange: () => void;
  onBlur?: () => void;
  autocomplete: TAutocomplete;
  placeholder?: string;
}

const PasswordInput = ({
  id,
  value,
  error,
  autocomplete,
  placeholder,
}: Props) => {
  const handleOnChange = () => {};
  const handleOnBlur = () => {};
  return (
    <Input
      type="password"
      id={id}
      value={value}
      error={error}
      onChange={handleOnChange}
      onBlur={handleOnBlur}
      autocomplete={autocomplete}
      placeholder={placeholder}
    />
  );
};

export default PasswordInput;
