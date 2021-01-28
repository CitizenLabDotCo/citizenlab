import React, { useState } from 'react';
import { Input, Button } from 'cl2-component-library';
import useLocale from 'hooks/useLocale';
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  id: string;
  value: string | null;
  error?: string;
  onChange: (password: string) => void;
  onBlur?: () => void;
  autocomplete?: 'current-password' | 'new-password';
  placeholder?: string;
}

const PasswordInput = ({
  id,
  value,
  error,
  autocomplete,
  placeholder,
}: Props) => {
  const locale = useLocale();
  const [showPassword, setShowPassword] = useState(false);
  const handleOnChange = () => {};
  const handleOnBlur = () => {};
  const handleOnClick = () => {
    setShowPassword(!showPassword);
  };

  if (!isNilOrError(locale)) {
    return (
      <>
        <Input
          type={showPassword ? 'text' : 'password'}
          id={id}
          value={value}
          error={error}
          onChange={handleOnChange}
          onBlur={handleOnBlur}
          autocomplete={autocomplete}
          placeholder={placeholder}
        />
        <Button locale={locale} onClick={handleOnClick}>
          {showPassword ? 'Hide password' : 'Show password'}
        </Button>
      </>
    );
  }

  return null;
};

export default PasswordInput;
