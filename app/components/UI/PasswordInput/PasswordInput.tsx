import React, { useState } from 'react';
import styled from 'styled-components';
import { Input, Button, Icon } from 'cl2-component-library';
import useLocale from 'hooks/useLocale';
import useTenant from 'hooks/useTenant';
import { isNilOrError } from 'utils/helperUtils';
import { ScreenReaderOnly } from 'utils/a11y';
import PasswordStrengthBar from 'react-password-strength-bar';

import { Props as WrapperProps } from './';

// components
import Error from 'components/UI/Error';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

const Container = styled.div`
  position: relative;
  display: flex;
  margin-bottom: 10px;
`;

const StyledInput = styled(Input)``;

const EyeIcon = styled(Icon)`
  width: 22px;
  height: 15px;
`;

const EyeClosedIcon = styled(Icon)`
  width: 22px;
  height: 19px;
  margin-bottom: -1px;
`;

const ShowPasswordButton = styled(Button)`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
`;

interface Props extends WrapperProps {
  minimumPasswordLength: number;
}

function isPasswordTooShort(
  password: string | null,
  minimumPasswordLength: number
) {
  if (typeof password === 'string') {
    return password.length < minimumPasswordLength;
  }

  return false;
}

const PasswordInputComponent = ({
  id,
  password,
  autocomplete,
  placeholder,
  onChange,
  onBlur,
  minimumPasswordLength,
  error,
  isLoginPasswordInput,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const locale = useLocale();
  const tenant = useTenant();
  let inputEl: HTMLInputElement | null = null;
  const [showPassword, setShowPassword] = useState(false);
  const hasMinimumLengthError =
    !isLoginPasswordInput &&
    isPasswordTooShort(password, minimumPasswordLength);
  const minimumPasswordLengthError = hasMinimumLengthError
    ? formatMessage(messages.minimumPasswordLengthErrorMessage, {
        minimumPasswordLength,
      })
    : null;

  const handleOnChange = (password: string) => {
    onChange(password, hasMinimumLengthError);

    if (hasMinimumLengthError && inputEl) {
      inputEl.focus();
    }
  };
  const handleOnBlur = () => {
    if (onBlur) {
      onBlur();
    }
  };
  const handleOnClick = () => {
    setShowPassword(!showPassword);
  };

  const setRef = (inputElement: HTMLInputElement) => {
    inputEl = inputElement;
  };

  if (!isNilOrError(locale) && !isNilOrError(tenant)) {
    return (
      <>
        <Container>
          <StyledInput
            // don't use the error prop in this component
            // because it will mess up the vertical alignment
            // of the ShowPasswordButton
            // We should remove Error from the Input component in the future
            type={showPassword ? 'text' : 'password'}
            id={id}
            value={password}
            onChange={handleOnChange}
            onBlur={handleOnBlur}
            autocomplete={autocomplete}
            placeholder={placeholder}
            setRef={setRef}
          />
          <ShowPasswordButton
            locale={locale}
            onClick={handleOnClick}
            buttonStyle="text"
            height={'100%'}
          >
            {showPassword ? (
              <EyeIcon
                name="eye"
                title={formatMessage(messages.hidePassword)}
              />
            ) : (
              <EyeClosedIcon
                name="eyeClosed"
                title={formatMessage(messages.showPassword)}
              />
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
        {!isLoginPasswordInput && (
          <PasswordStrengthBar
            password={password || undefined}
            minLength={minimumPasswordLength}
            // shortScoreWord={'Te kort'}
            // scoreWords={['Zwak', 'Redelijk', 'Goed', 'Sterk', 'Heel sterk']}
          />
        )}
        <Error text={error} />
        <Error text={minimumPasswordLengthError} />
      </>
    );
  }

  return null;
};

export default injectIntl(PasswordInputComponent);
