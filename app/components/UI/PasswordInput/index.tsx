import React, { useState } from 'react';
import styled from 'styled-components';
import { Input, Button } from 'cl2-component-library';
import useLocale from 'hooks/useLocale';
import { isNilOrError } from 'utils/helperUtils';

const Container = styled.div`
  position: relative;
  display: flex;
`;

const StyledInput = styled(Input)``;

const ShowPasswordButton = styled(Button)`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 15px;
`;

interface Props {
  id: string;
  value: string | null;
  error?: string | null;
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
  onChange,
  onBlur,
}: Props) => {
  const locale = useLocale();
  const [showPassword, setShowPassword] = useState(false);
  const handleOnChange = (password: string) => {
    onChange(password);
  };
  const handleOnBlur = () => {
    if (onBlur) {
      onBlur();
    }
  };
  const handleOnClick = () => {
    setShowPassword(!showPassword);
  };

  if (!isNilOrError(locale)) {
    return (
      <Container>
        <StyledInput
          type={showPassword ? 'text' : 'password'}
          id={id}
          value={value}
          error={error}
          onChange={handleOnChange}
          onBlur={handleOnBlur}
          autocomplete={autocomplete}
          placeholder={placeholder}
        />
        <ShowPasswordButton locale={locale} onClick={handleOnClick}>
          {showPassword ? 'Hide password' : 'Show password'}
        </ShowPasswordButton>
      </Container>
    );
  }

  return null;
};

export default PasswordInput;
