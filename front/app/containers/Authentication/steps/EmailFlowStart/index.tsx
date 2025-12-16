import React, { useMemo } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, FormProvider } from 'react-hook-form';
import { string, object } from 'yup';

import { SSOProvider } from 'api/authentication/singleSignOn';

import oldMessages from 'containers/Authentication/steps/_components/AuthProviderButton/messages';
import { SetError } from 'containers/Authentication/typings';
import useAuthConfig from 'containers/Authentication/useAuthConfig';

import Input from 'components/HookForm/Input';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import FranceConnectButton from 'components/UI/FranceConnectButton';
import Or from 'components/UI/Or';

import { useIntl } from 'utils/cl-intl';
import {
  isCLErrorsWrapper,
  handleHookFormSubmissionError,
} from 'utils/errorUtils';
import { isValidEmail } from 'utils/validate';

import sharedMessages from '../messages';

import SSOButtons from './SSOButtons';

interface Props {
  loading: boolean;
  setError: SetError;
  onSubmit: (email: string) => void;
  onSwitchToSSO: (ssoProvider: SSOProvider) => void;
  onEnterFranceConnect: () => void;
}

interface FormValues {
  email: string;
}

const DEFAULT_VALUES: Partial<FormValues> = {
  email: undefined,
};

const EmailFlowStart = ({
  loading,
  setError,
  onSubmit,
  onSwitchToSSO,
  onEnterFranceConnect,
}: Props) => {
  const { passwordLoginEnabled, ssoProviders } = useAuthConfig();

  const { formatMessage } = useIntl();

  const schema = useMemo(
    () =>
      object({
        email: string()
          .email(formatMessage(sharedMessages.emailFormatError))
          .required(formatMessage(sharedMessages.emailMissingError))
          .test(
            '',
            formatMessage(sharedMessages.emailFormatError),
            isValidEmail
          ),
      }),
    [formatMessage]
  );

  const methods = useForm<FormValues>({
    mode: 'onSubmit',
    defaultValues: DEFAULT_VALUES,
    resolver: yupResolver(schema),
  });

  const handleSubmit = async ({ email }: FormValues) => {
    try {
      await onSubmit(email);
    } catch (e) {
      if (isCLErrorsWrapper(e)) {
        handleHookFormSubmissionError(e, methods.setError);
        return;
      }

      setError('unknown');
    }
  };

  return (
    <Box data-cy="email-flow-start">
      {ssoProviders.franceconnect && (
        <>
          <FranceConnectButton
            logoAlt={formatMessage(oldMessages.signUpButtonAltText, {
              loginMechanismName: 'FranceConnect',
            })}
            onClick={onEnterFranceConnect}
          />
          {passwordLoginEnabled && (
            <Box mt="24px">
              <Or />
            </Box>
          )}
        </>
      )}
      {passwordLoginEnabled && (
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(handleSubmit)}>
            <Text mt="0px" mb="32px" color="tenantText">
              {formatMessage(sharedMessages.enterYourEmailAddress)}
            </Text>
            <Box data-cy="email-flow-start-email-input">
              <Input
                name="email"
                type="email"
                autocomplete="email"
                label={formatMessage(sharedMessages.email)}
              />
            </Box>
            <Box w="100%" display="flex" mt="32px">
              <ButtonWithLink
                dataCy="email-flow-start-continue-button"
                type="submit"
                width="100%"
                disabled={loading}
                processing={loading}
              >
                {formatMessage(sharedMessages.continue)}
              </ButtonWithLink>
            </Box>
          </form>
        </FormProvider>
      )}
      <SSOButtons onClickSSO={onSwitchToSSO} />
    </Box>
  );
};

export default EmailFlowStart;
