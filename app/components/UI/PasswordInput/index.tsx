import React from 'react';
import PasswordInput from './PasswordInput';

interface Props {
  id: string;
  value: string | null;
  error?: string | null;
  onChange: (password: string) => void;
  onBlur?: () => void;
  setRef?: (element: HTMLInputElement) => void;
  autocomplete?: 'current-password' | 'new-password';
  placeholder?: string;
}

const Component = ({
  id,
  value,
  error,
  onChange,
  onBlur,
  autocomplete,
  placeholder,
  setRef,
}: Props) => {
  return (
    <PasswordInput
      id={id}
      value={value}
      error={error}
      onChange={onChange}
      onBlur={onBlur}
      autocomplete={autocomplete}
      placeholder={placeholder}
      setRef={setRef}
    />
  );
};

export default Component;
