import React from 'react';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import { isNilOrError } from 'utils/helperUtils';

import PasswordInputComponent from './PasswordInput';

type PasswordErrors = {
  minimumLengthError?: boolean;
  emptyError?: boolean;
};

export interface Props {
  id: string;
  password: string | null;
  onChange: (password: string) => void;
  onBlur?: (e: React.FormEvent<HTMLInputElement>) => void;
  setRef?: (element: HTMLInputElement) => void;
  autocomplete?: 'current-password' | 'new-password';
  placeholder?: string;
  isLoginPasswordInput?: boolean;
  errors?: PasswordErrors;
  ariaInvalid?: boolean;
  ariaDescribedBy?: string;
  required?: boolean;
  // zxcvbn user_inputs (email/name) for the live strength meter.
  userInputs?: string[];
}

export const DEFAULT_MINIMUM_PASSWORD_LENGTH = 8;

export function hasPasswordMinimumLength(
  password: string,
  tenantMinimumPasswordLength: number | undefined
) {
  return tenantMinimumPasswordLength
    ? password.length < tenantMinimumPasswordLength
    : password.length < DEFAULT_MINIMUM_PASSWORD_LENGTH;
}

// True if the password meets the minimum zxcvbn score (0-4); a falsy threshold
// disables the check. `userInputs` (email/name) let zxcvbn penalise passwords
// derived from them. zxcvbn is large, so it is imported lazily.
export async function passwordMeetsStrength(
  password: string,
  minimumStrength: number | undefined,
  userInputs: string[] = []
): Promise<boolean> {
  if (!minimumStrength) return true;
  const { default: zxcvbn } = await import('zxcvbn');
  return zxcvbn(password, userInputs).score >= minimumStrength;
}

// Collects the available user-identifying values (email/name) as zxcvbn
// user_inputs, mirroring the backend's inputs in user_password_validations.rb.
export function passwordUserInputs(inputs?: {
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
}): string[] {
  return [inputs?.first_name, inputs?.last_name, inputs?.email].filter(
    (input): input is string => !!input
  );
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
  ariaInvalid,
  ariaDescribedBy,
  required,
  userInputs,
}: Props) => {
  const { data: appConfig } = useAppConfiguration();

  if (!isNilOrError(appConfig)) {
    const minimumPasswordLength =
      appConfig.data.attributes.settings.password_login?.minimum_length ||
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
        ariaInvalid={ariaInvalid}
        ariaDescribedBy={ariaDescribedBy}
        required={required}
        userInputs={userInputs}
      />
    );
  }

  return null;
};

export default PasswordInput;
