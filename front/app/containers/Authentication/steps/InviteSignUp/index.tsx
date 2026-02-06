import React, { useState } from 'react';

import { Box, Label } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, FormProvider } from 'react-hook-form';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { Parameters as CreateAccountFromInviteParameters } from 'api/authentication/createAccountFromInvite';

import useLocale from 'hooks/useLocale';

import { SetError, State } from 'containers/Authentication/typings';

import { SectionField } from 'components/admin/Section';
import Input from 'components/HookForm/Input';
import PasswordInput from 'components/HookForm/PasswordInput';
import commentsMessages from 'components/PostShowComponents/Comments/messages';
import { StyledPasswordIconTooltip } from 'components/smallForm';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import Error from 'components/UI/Error';
import { DEFAULT_MINIMUM_PASSWORD_LENGTH } from 'components/UI/PasswordInput';

import { useIntl, FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import {
  isCLErrorsWrapper,
  handleHookFormSubmissionError,
} from 'utils/errorUtils';

import sharedMessages from '../messages';
import PoliciesMarkup from '../Policies/PoliciesMarkup';

import { DEFAULT_VALUES, getSchema, FormValues } from './form';

interface Props {
  state: State;
  loading: boolean;
  setError: SetError;
  onSubmit: (parameters: CreateAccountFromInviteParameters) => void;
}

const InviteSignUp = ({ state, loading, setError, onSubmit }: Props) => {
  const { data: appConfiguration } = useAppConfiguration();
  const locale = useLocale();
  const { formatMessage } = useIntl();
  const [profanityApiError, setProfanityApiError] = useState(false);

  const appConfigSettings = appConfiguration?.data.attributes.settings;
  const minimumPasswordLength =
    appConfigSettings?.password_login?.minimum_length ??
    DEFAULT_MINIMUM_PASSWORD_LENGTH;

  const schema = getSchema(minimumPasswordLength, formatMessage);

  const methods = useForm<FormValues>({
    mode: 'onSubmit',
    defaultValues: {
      ...DEFAULT_VALUES,
      ...state.prefilledBuiltInFields,
    },
    resolver: yupResolver(schema),
  });

  const token = state.token;

  if (!token) return null;

  const handleSubmit = async ({
    first_name,
    last_name,
    email,
    password,
  }: FormValues) => {
    try {
      await onSubmit({
        firstName: first_name,
        lastName: last_name,
        email,
        password,
        locale,
        token,
      });
      setProfanityApiError(false);
    } catch (e) {
      const profanityApiError = Array.isArray(e?.errors?.base)
        ? e.errors.base.find(
            (apiError) => apiError.error === 'includes_banned_words'
          )
        : null;
      if (profanityApiError) {
        setProfanityApiError(true);
      }

      if (isCLErrorsWrapper(e)) {
        handleHookFormSubmissionError(e, methods.setError);
        return;
      }

      setError('account_creation_failed');
    }
  };

  return (
    <Box id="e2e-sign-up-email-password-container">
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleSubmit)}>
          <SectionField>
            {profanityApiError && (
              <Error
                text={
                  <FormattedMessage
                    {...commentsMessages.profanityError}
                    values={{
                      guidelinesLink: (
                        <Link to="/pages/faq" target="_blank">
                          {formatMessage(commentsMessages.guidelinesLinkText)}
                        </Link>
                      ),
                    }}
                  />
                }
              />
            )}
          </SectionField>
          <Box id="e2e-firstName-container">
            <Input
              name="first_name"
              id="firstName"
              type="text"
              autocomplete="given-name"
              label={formatMessage(sharedMessages.firstNamesLabel)}
            />
          </Box>
          <Box id="e2e-lastName-container" mt="16px">
            <Input
              name="last_name"
              id="lastName"
              type="text"
              autocomplete="family-name"
              label={formatMessage(sharedMessages.lastNameLabel)}
            />
          </Box>
          <Box id="e2e-email-container" mt="16px">
            <Input
              name="email"
              id="email"
              type="email"
              autocomplete="email"
              label={formatMessage(sharedMessages.email)}
            />
          </Box>
          <Box id="e2e-password-container" mt="16px">
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Label>
                <span>{formatMessage(sharedMessages.password)}</span>
              </Label>
              <StyledPasswordIconTooltip />
            </Box>
            <PasswordInput
              name="password"
              id="password"
              autocomplete="current-password"
            />
          </Box>
          <Box mt="24px">
            <PoliciesMarkup />
          </Box>
          <Box w="100%" display="flex" mt="24px">
            <ButtonWithLink
              type="submit"
              width="auto"
              disabled={loading}
              processing={loading}
              id="e2e-signup-password-submit-button"
            >
              {formatMessage(sharedMessages.continue)}
            </ButtonWithLink>
          </Box>
        </form>
      </FormProvider>
    </Box>
  );
};

export default InviteSignUp;
