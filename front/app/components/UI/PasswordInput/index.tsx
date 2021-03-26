import React from 'react';
import { isNilOrError } from 'utils/helperUtils';

// hooks
import useAppConfiguration from 'hooks/useAppConfiguration';

// components
import PasswordInputComponent from './PasswordInput';

type PasswordErrors = {
  minimumLengthError?: boolean;
  emptyError?: boolean;
};

export interface Props {
  id: string;
  password: string | null;
  onChange: (password: string) => void;
  onBlur?: () => void;
  setRef?: (element: HTMLInputElement) => void;
  autocomplete?: 'current-password' | 'new-password';
  placeholder?: string;
  isLoginPasswordInput?: boolean;
  errors: PasswordErrors;
}

const DEFAULT_MINIMUM_PASSWORD_LENGTH = 8;

export function hasPasswordMinimumLength(
  password: string,
  tenantMinimumPasswordLength: number | undefined
) {
  return tenantMinimumPasswordLength
    ? password.length < tenantMinimumPasswordLength
    : password.length < DEFAULT_MINIMUM_PASSWORD_LENGTH;
}

const PasswordInput = ({
  id,
  password,
  onChange,
  onBlur,
  setRef,
  autocomplete,
  placeholder,
  isLoginPasswordInput,
  errors,
}: Props) => {
  const tenant = useAppConfiguration();

  if (!isNilOrError(tenant)) {
    const minimumPasswordLength =
      tenant.data.attributes.settings.password_login?.minimum_length ||
      DEFAULT_MINIMUM_PASSWORD_LENGTH;

    return (
      <PasswordInputComponent
        minimumPasswordLength={minimumPasswordLength}
        id={id}
        password={password}
        onChange={onChange}
        onBlur={onBlur}
        setRef={setRef}
        autocomplete={autocomplete}
        placeholder={placeholder}
        isLoginPasswordInput={isLoginPasswordInput}
        errors={errors}
      />
    );
  }

  return null;
};

export default PasswordInput;
