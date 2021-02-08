import React from 'react';
import { isNilOrError } from 'utils/helperUtils';

// hooks
import useTenant from 'hooks/useTenant';

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

export function hasPasswordMinimumLength(
  password: string,
  tenantMinimumPasswordLength: number | undefined
) {
  return tenantMinimumPasswordLength
    ? password.length < tenantMinimumPasswordLength
    : password.length < 8;
}

const PasswordInput = (props: Props) => {
  const tenant = useTenant();

  if (!isNilOrError(tenant)) {
    const minimumPasswordLength =
      tenant.data.attributes.settings.password_login?.minimum_length || 8;

    return (
      <PasswordInputComponent
        minimumPasswordLength={minimumPasswordLength}
        {...props}
      />
    );
  }

  return null;
};

export default PasswordInput;
