import React, { useState, lazy, Suspense } from 'react';

import { Input, IconButton, colors } from '@citizenlab/cl2-component-library';
import { darken } from 'polished';
import { WrappedComponentProps } from 'react-intl';
import styled from 'styled-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import useLocale from 'hooks/useLocale';

import Error from 'components/UI/Error';

import { ScreenReaderOnly } from 'utils/a11y';
import { injectIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from './messages';

import { Props as WrapperProps } from './';

const PasswordStrengthBar = lazy(() => import('react-password-strength-bar'));

const Container = styled.div`
  position: relative;
  display: flex;
  margin-bottom: 10px;
`;

const StyledInput = styled(Input)`
  & input::-ms-reveal,
  & input::-ms-clear {
    display: none;
  }
`;

const ShowPasswordIconButton = styled(IconButton)<{ showPassword: boolean }>`
  position: absolute;
  top: 0;
  bottom: ${({ showPassword }) => (showPassword ? '1px' : '0')};
  right: 6px;
`;

type PasswordScore = 0 | 1 | 2 | 3 | 4;

interface Props extends WrapperProps {
  minimumPasswordLength: number;
}

const PasswordInputComponent = ({
  id,
  password,
  autocomplete,
  placeholder,
  onChange,
  onBlur,
  minimumPasswordLength,
  isLoginPasswordInput,
  setRef,
  errors = {},
  intl: { formatMessage },
  ariaInvalid,
  ariaDescribedBy,
}: Props & WrappedComponentProps) => {
  const locale = useLocale();
  const { data: appConfig } = useAppConfiguration();
  const [showPassword, setShowPassword] = useState(false);
  const [passwordScore, setPasswordScore] = useState<PasswordScore>(0);
  const { minimumLengthError, emptyError } = errors;
  const minimumPasswordLengthErrorMessage = minimumLengthError
    ? formatMessage(messages.minimumPasswordLengthError, {
        minimumPasswordLength,
      })
    : null;
  const emptyPasswordErrorMessage = emptyError
    ? formatMessage(messages.passwordEmptyError)
    : null;

  const handleOnChange = (password: string) => {
    onChange(password);
  };

  const handleOnBlur = (e) => {
    if (onBlur) {
      onBlur(e);
    }
  };

  const handleOnClick = () => {
    setShowPassword(!showPassword);
  };

  const setInputRef = (inputElement: HTMLInputElement) => {
    if (setRef) {
      setRef(inputElement);
    }
  };

  const handleOnChangeScore = (score: PasswordScore) => {
    setPasswordScore(score);
  };

  if (!isNilOrError(locale) && !isNilOrError(appConfig)) {
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
            setRef={setInputRef}
            ariaInvalid={ariaInvalid}
            ariaDescribedBy={ariaDescribedBy}
          />
          <ShowPasswordIconButton
            showPassword={showPassword}
            iconName={showPassword ? 'eye' : 'eye-off'}
            onClick={handleOnClick}
            a11y_buttonActionMessage={formatMessage(
              showPassword ? messages.hidePassword : messages.showPassword
            )}
            iconColor={colors.textSecondary}
            iconColorOnHover={darken(0.1, colors.textSecondary)}
            // prevent form submission
            buttonType="button"
          />
          <ScreenReaderOnly aria-live="polite">
            {formatMessage(
              showPassword
                ? messages.a11y_passwordVisible
                : messages.a11y_passwordHidden
            )}
          </ScreenReaderOnly>
        </Container>
        {!isLoginPasswordInput && (
          <>
            <Suspense fallback={null}>
              <PasswordStrengthBar
                password={password || undefined}
                minLength={minimumPasswordLength}
                shortScoreWord={formatMessage(
                  messages.initialPasswordStrengthCheckerMessage,
                  {
                    minimumPasswordLength,
                  }
                )}
                scoreWords={[
                  formatMessage(messages.strength1Password),
                  formatMessage(messages.strength2Password),
                  formatMessage(messages.strength3Password),
                  formatMessage(messages.strength4Password),
                  formatMessage(messages.strength5Password),
                ]}
                onChangeScore={handleOnChangeScore}
                scoreWordStyle={{
                  color: colors.textSecondary,
                }}
              />
            </Suspense>
            <ScreenReaderOnly aria-live="polite">
              {formatMessage(
                {
                  0: messages.a11y_strength1Password,
                  1: messages.a11y_strength2Password,
                  2: messages.a11y_strength3Password,
                  3: messages.a11y_strength4Password,
                  4: messages.a11y_strength5Password,
                }[passwordScore]
              )}
            </ScreenReaderOnly>
          </>
        )}
        {isLoginPasswordInput && emptyPasswordErrorMessage && (
          <Error id="password-error" text={emptyPasswordErrorMessage} />
        )}
        {!isLoginPasswordInput && minimumPasswordLengthErrorMessage && (
          <Error id="password-error" text={minimumPasswordLengthErrorMessage} />
        )}
      </>
    );
  }

  return null;
};

export default injectIntl(PasswordInputComponent);
