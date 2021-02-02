import React from 'react';
import { isNilOrError } from 'utils/helperUtils';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// hooks
import useTenant from 'hooks/useTenant';

// components
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
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const tenant = useTenant();

  if (!isNilOrError(tenant)) {
    const minimumPasswordLength =
      tenant.data.attributes.settings.password_login?.minimum_length;
    const minimumPasswordLengthError = minimumPasswordLength
      ? formatMessage(messages.minimumPasswordLengthErrorMessage, {
          minimumPasswordLength,
        })
      : null;

    return (
      <PasswordInput
        id={id}
        value={value}
        error={minimumPasswordLengthError}
        onChange={onChange}
        onBlur={onBlur}
        autocomplete={autocomplete}
        placeholder={placeholder}
        setRef={setRef}
      />
    );
  }

  return null;
};

export default injectIntl(Component);
