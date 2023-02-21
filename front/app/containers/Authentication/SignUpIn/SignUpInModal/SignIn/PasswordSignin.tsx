import React, { useState, useRef, useEffect } from 'react';

// libraries
import Link from 'utils/cl-router/Link';

// components
import {
  Input,
  Checkbox,
  Box,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import PasswordInput from 'components/UI/PasswordInput';
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import { FormLabel } from 'components/UI/FormComponents';
import { Options, Option } from '../styles';

// services
import { signIn } from 'services/auth';

// i18n
import { useIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// utils
import { isValidEmail, isValidPhoneNumber } from 'utils/validate';
import { isNilOrError } from 'utils/helperUtils';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from '../tracks';

// style
import styled from 'styled-components';

// typings
import { ISignUpInMetaData } from '../typings';
import useFeatureFlag from 'hooks/useFeatureFlag';
import useAppConfiguration from 'hooks/useAppConfiguration';

const Container = styled.div`
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
`;

const Form = styled.form`
  width: 100%;
`;

const FormElement = styled(Box)`
  width: 100%;
  margin-bottom: 16px;
  position: relative;
`;

const ButtonWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 10px;
`;

interface Props {
  metaData: ISignUpInMetaData;
  onSignInCompleted: (userId: string) => void;
  onGoToSignUp: () => void;
  onGoToLogInOptions: () => void;
  className?: string;
}

const PasswordSignin = ({
  metaData,
  onSignInCompleted,
  onGoToLogInOptions,
  onGoToSignUp,
  className,
}: Props) => {
  const { formatMessage } = useIntl();
  const appConfig = useAppConfiguration();
  const passwordLoginEnabled = useFeatureFlag({ name: 'password_login' });
  const googleLoginEnabled = useFeatureFlag({ name: 'google_login' });
  const facebookLoginEnabled = useFeatureFlag({ name: 'facebook_login' });
  const azureAdLoginEnabled = useFeatureFlag({ name: 'azure_ad_login' });
  const franceconnectLoginEnabled = useFeatureFlag({
    name: 'franceconnect_login',
  });
  const [email, setEmail] = useState<string | null>(null);
  const [password, setPassword] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [emailOrPhoneNumberError, setEmailOrPhoneNumberError] = useState<
    string | null
  >(null);
  const [signInError, setSignInError] = useState<string | null>(null);

  const [hasEmptyPasswordError, setHasEmptyPasswordError] = useState(false);
  let emailInputElement = useRef<HTMLInputElement | null>(null);
  let passwordInputElement = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    trackEventByName(tracks.signInEmailPasswordEntered);

    return () => trackEventByName(tracks.signInEmailPasswordExited);
  }, []);

  const handleEmailOnChange = (email: string) => {
    setEmail(email);
    setEmailOrPhoneNumberError(null);
    setSignInError(null);
  };

  const handlePasswordOnChange = (password: string) => {
    setPassword(password);
    setHasEmptyPasswordError(false);
    setSignInError(null);
  };

  const handleRememberMeOnChange = () => {
    setRememberMe((rememberMe) => !rememberMe);
  };

  const handleGoToLogInOptions = (event: React.FormEvent) => {
    event.preventDefault();
    onGoToLogInOptions();
  };

  const handleGoToSignUp = (event: React.FormEvent) => {
    event.preventDefault();
    onGoToSignUp();
  };

  const validate = (
    phoneLoginEnabled: boolean,
    emailOrPhoneNumber: string | null,
    password: string | null
  ) => {
    const hasValidPhoneNumber = emailOrPhoneNumber
      ? isValidPhoneNumber(emailOrPhoneNumber)
      : false;
    const hasValidEmail = emailOrPhoneNumber
      ? isValidEmail(emailOrPhoneNumber)
      : false;

    const hasEmailOrPhoneNumberValidationError = phoneLoginEnabled
      ? !hasValidEmail && !hasValidPhoneNumber
      : !hasValidEmail;
    const hasEmptyPasswordError = password ? password.length === 0 : true;

    setEmailOrPhoneNumberError(
      hasEmailOrPhoneNumberValidationError
        ? formatMessage(
            phoneLoginEnabled
              ? messages.emailOrPhoneNumberError
              : messages.emailError
          )
        : null
    );
    setHasEmptyPasswordError(hasEmptyPasswordError);

    if (hasEmailOrPhoneNumberValidationError && emailInputElement.current) {
      emailInputElement.current.focus();
    }

    if (
      !hasEmailOrPhoneNumberValidationError &&
      hasEmptyPasswordError &&
      passwordInputElement.current
    ) {
      passwordInputElement.current.focus();
    }

    return !hasEmailOrPhoneNumberValidationError && !hasEmptyPasswordError;
  };

  const handleOnSubmit =
    (phoneLoginEnabled: boolean) => async (event: React.FormEvent) => {
      event.preventDefault();
      if (isNilOrError(appConfig)) {
        return;
      }

      const tokenLifetime =
        appConfig.attributes.settings.core
          .authentication_token_lifetime_in_days;

      if (validate(phoneLoginEnabled, email, password) && email && password) {
        try {
          setProcessing(true);
          const user = await signIn(email, password, rememberMe, tokenLifetime);
          trackEventByName(tracks.signInEmailPasswordCompleted);
          onSignInCompleted(user.data.id);
        } catch (error) {
          trackEventByName(tracks.signInEmailPasswordFailed, { error });
          const signInError = formatMessage(messages.signInError);
          setSignInError(signInError);
          setProcessing(false);
        }
      }
    };

  const handleEmailInputSetRef = (element: HTMLInputElement) => {
    emailInputElement.current = element;
  };

  const handlePasswordInputSetRef = (element: HTMLInputElement) => {
    passwordInputElement.current = element;
  };

  const phoneLoginEnabled =
    !isNilOrError(appConfig) &&
    appConfig.attributes.settings.password_login?.phone
      ? appConfig.attributes.settings.password_login.phone
      : false;
  const enabledProviders = [
    passwordLoginEnabled,
    googleLoginEnabled,
    facebookLoginEnabled,
    azureAdLoginEnabled,
    franceconnectLoginEnabled,
  ].filter((provider) => provider === true);
  const tabletOrSmaller = useBreakpoint('tablet');
  const isDesktop = !tabletOrSmaller;

  return (
    <Container
      id="e2e-sign-in-email-password-container"
      className={className || ''}
    >
      <Form
        id="signin"
        onSubmit={handleOnSubmit(phoneLoginEnabled)}
        noValidate={true}
      >
        <FormElement>
          <FormLabel
            htmlFor="email"
            labelMessage={
              phoneLoginEnabled
                ? messages.emailOrPhoneLabel
                : messages.emailLabel
            }
          />
          <Input
            type="email"
            id="email"
            value={email}
            error={emailOrPhoneNumberError}
            onChange={handleEmailOnChange}
            setRef={handleEmailInputSetRef}
            autocomplete="email"
            autoFocus={!!(isDesktop && !metaData?.noAutofocus)}
          />
        </FormElement>

        <FormElement>
          <FormLabel htmlFor="password" labelMessage={messages.passwordLabel} />
          <PasswordInput
            id="password"
            password={password}
            onChange={handlePasswordOnChange}
            setRef={handlePasswordInputSetRef}
            autocomplete="current-password"
            isLoginPasswordInput
            errors={{ emptyError: hasEmptyPasswordError }}
          />
        </FormElement>

        <FormElement paddingTop="8px">
          <Checkbox
            label={formatMessage(messages.rememberMeLabel)}
            labelTooltipText={formatMessage(messages.rememberMeTooltip)}
            checked={rememberMe}
            onChange={handleRememberMeOnChange}
          />
        </FormElement>

        <FormElement>
          <ButtonWrapper>
            <Button
              onClick={handleOnSubmit(phoneLoginEnabled)}
              processing={processing}
              text={formatMessage(messages.submit)}
              id="e2e-signin-password-submit-button"
            />
          </ButtonWrapper>
          <Error marginTop="10px" text={signInError} />
        </FormElement>
      </Form>

      <Options>
        <Option>
          <Link
            to="/password-recovery"
            className="link e2e-password-recovery-link"
          >
            <FormattedMessage {...messages.forgotPassword2} />
          </Link>
        </Option>
        <Option>
          {enabledProviders.length > 1 ? (
            <button
              id="e2e-login-options"
              onClick={handleGoToLogInOptions}
              className="link"
            >
              <FormattedMessage {...messages.backToLoginOptions} />
            </button>
          ) : (
            <FormattedMessage
              {...messages.goToSignUp}
              values={{
                goToOtherFlowLink: (
                  <button
                    id="e2e-goto-signup"
                    onClick={handleGoToSignUp}
                    className="link"
                  >
                    {formatMessage(messages.signUp)}
                  </button>
                ),
              }}
            />
          )}
        </Option>
      </Options>
    </Container>
  );
};

export default PasswordSignin;
