import React, { useState, useRef, useEffect } from 'react';

import { Success } from '@citizenlab/cl2-component-library';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';

import sendPasswordResetMail from 'api/authentication/reset_password/sendPasswordResetEmail';

import {
  StyledContentContainer,
  Title,
  StyledButton,
  Form,
  Subtitle,
  StyledInput,
} from 'components/smallForm';
import { FormLabel } from 'components/UI/FormComponents';

import { useIntl } from 'utils/cl-intl';
import { isValidEmail } from 'utils/validate';

import messages from './messages';

const PasswordRecovery = () => {
  // Params are only passed when forcing a reset
  const [searchParams] = useSearchParams();
  const forceReset = searchParams.get('force');
  const passedEmail = searchParams.get('email');

  const [email, setEmail] = useState<string | null>(passedEmail);
  const [emailError, setEmailError] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const { formatMessage } = useIntl();

  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, []);

  const validate = (email: string | null) => {
    const hasError = !email || !isValidEmail(email);
    setEmailError(hasError);
    if (hasError && emailInputRef.current) {
      emailInputRef.current.focus();
    }
    return !hasError;
  };

  const handleEmailOnChange = (value: string) => {
    setEmailError(false);
    setSubmitError(false);
    setEmail(value);
  };

  const handleOnSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (validate(email) && email) {
      try {
        setProcessing(true);
        setSuccess(false);
        await sendPasswordResetMail(email);
        setEmail(null);
        setProcessing(false);
        setSuccess(true);
      } catch {
        setProcessing(false);
        setSuccess(false);
        setSubmitError(true);
      }
    } else {
      setEmailError(true);
    }
  };

  const helmetTitle = formatMessage(messages.helmetTitle);
  const helmetDescription = formatMessage(messages.helmetDescription);
  const title = formatMessage(messages.title);
  const subtitle = formatMessage(messages.subtitle);
  const emailPlaceholder = formatMessage(messages.emailPlaceholder);
  const resetPassword = formatMessage(messages.resetPassword);
  const forceResetMessage = forceReset
    ? `${formatMessage(messages.forceResetMessage)} `
    : '';

  // Showing the same message for success and submission error because we don't want to give away information about whether an email address is registered or not
  const feedbackMessage =
    success || submitError
      ? formatMessage(messages.passwordResetSuccessMessage)
      : null;
  let errorMessage: string | null = null;
  if (emailError) {
    errorMessage = formatMessage(messages.emailError);
  }

  return (
    <>
      <Helmet
        title={helmetTitle}
        meta={[{ name: 'description', content: helmetDescription }]}
      />
      <main>
        <StyledContentContainer>
          <Title style={{ marginBottom: '15px' }}>{title}</Title>
          <Subtitle>
            {forceResetMessage}
            {subtitle}
          </Subtitle>
          <Form onSubmit={handleOnSubmit}>
            <FormLabel htmlFor="email" labelMessage={messages.emailLabel} />
            <StyledInput
              id="email"
              type="email"
              autocomplete="email"
              value={email}
              error={errorMessage}
              placeholder={emailPlaceholder}
              onChange={handleEmailOnChange}
              setRef={(el) => void (emailInputRef.current = el)}
            />
            <StyledButton
              size="m"
              width="100%"
              processing={processing}
              text={resetPassword}
              onClick={handleOnSubmit}
              className="e2e-submit-reset"
            />
            {feedbackMessage && (
              <Success text={feedbackMessage} className="e2e-success-reset" />
            )}
          </Form>
        </StyledContentContainer>
      </main>
    </>
  );
};

export default PasswordRecovery;
