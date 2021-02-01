import React, { useState } from 'react';
import styled from 'styled-components';
import { Input, Button } from 'cl2-component-library';
import useLocale from 'hooks/useLocale';
import { isNilOrError } from 'utils/helperUtils';
import { ScreenReaderOnly } from 'utils/a11y';
// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

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
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
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
          {formatMessage(
            showPassword ? messages.hidePassword : messages.showPassword
          )}
        </ShowPasswordButton>
        <ScreenReaderOnly aria-live="polite">
          {formatMessage(
            showPassword
              ? messages.a11y_passwordVisible
              : messages.a11y_passwordHidden
          )}
        </ScreenReaderOnly>
      </Container>
    );
  }

  return null;
};

export default injectIntl(PasswordInput);
