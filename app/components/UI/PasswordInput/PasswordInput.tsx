import React, { useState, lazy, Suspense } from 'react';
import styled from 'styled-components';
import { Input, Button, Icon, colors } from 'cl2-component-library';
import useLocale from 'hooks/useLocale';
import useAppConfiguration from 'hooks/useAppConfiguration';
import { isNilOrError } from 'utils/helperUtils';
import { ScreenReaderOnly } from 'utils/a11y';
import { Props as WrapperProps } from './';
// components
const PasswordStrengthBar = lazy(() => import('react-password-strength-bar'));
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

const StyledInput = styled(Input)`
  & input::-ms-reveal,
  & input::-ms-clear {
    display: none;
  }
`;

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
  errors,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const locale = useLocale();
  const tenant = useAppConfiguration();
  const [showPassword, setShowPassword] = useState(false);
  const [passwordScore, setPasswordScore] = useState<PasswordScore>(0);
  const { minimumLengthError, emptyError } = errors;
  const minimumPasswordLengthErrorMessage = minimumLengthError
    ? formatMessage(messages.minimumPasswordLengthErrorMessage, {
        minimumPasswordLength,
      })
    : null;
  const emptyPasswordErrorMessage = emptyError
    ? formatMessage(messages.emptyPasswordError)
    : null;

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

  const setInputRef = (inputElement: HTMLInputElement) => {
    if (setRef) {
      setRef(inputElement);
    }
  };

  const handleOnChangeScore = (score: PasswordScore) => {
    setPasswordScore(score);
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
            setRef={setInputRef}
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
                  color: colors.label,
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
        {isLoginPasswordInput && <Error text={emptyPasswordErrorMessage} />}
        {!isLoginPasswordInput && (
          <Error text={minimumPasswordLengthErrorMessage} />
        )}
      </>
    );
  }

  return null;
};

export default injectIntl(PasswordInputComponent);
