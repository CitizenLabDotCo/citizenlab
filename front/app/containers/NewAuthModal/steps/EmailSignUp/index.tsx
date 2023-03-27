import React, { useMemo } from 'react';

// components
import { Box, Text } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import SSOButtons from './SSOButtons';
import Link from 'utils/cl-router/Link';
import { ConsentText } from 'components/AuthProviders/Consent';

// hooks
import useLocale from 'hooks/useLocale';

// i18n
import { useIntl, FormattedMessage } from 'utils/cl-intl';
import sharedMessages from '../messages';
import oldMessages from 'components/AuthProviders/messages';
import messages from './messages';

// form
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { string, object, boolean } from 'yup';
import Input from 'components/HookForm/Input';
import Checkbox from 'components/HookForm/Checkbox';

// utils
import { isNilOrError } from 'utils/helperUtils';

// typings
import { Status, ErrorCode } from '../../typings';
import { SSOProvider } from 'services/singleSignOn';
import { Locale } from 'typings';

interface Props {
  status: Status;
  error: ErrorCode | null;
  onSubmit: (email: string, locale: Locale) => void;
  onSwitchToSSO: (ssoProvider: SSOProvider) => void;
}

interface FormValues {
  email: string;
  termsAndConditionsAccepted: boolean;
  privacyPolicyAccepted: boolean;
}

const DEFAULT_VALUES: Partial<FormValues> = {
  email: undefined,
  termsAndConditionsAccepted: false,
  privacyPolicyAccepted: false,
};

const EmailSignUp = ({ status, onSubmit, onSwitchToSSO }: Props) => {
  const { formatMessage } = useIntl();
  const locale = useLocale();

  const loading = status === 'pending';

  const schema = useMemo(
    () =>
      object({
        email: string()
          .email(formatMessage(messages.emailFormatError))
          .required(formatMessage(messages.emailMissingError)),
        termsAndConditionsAccepted: boolean().test(
          '',
          formatMessage(oldMessages.tacError),
          (value) => !!value
        ),
        privacyPolicyAccepted: boolean().test(
          '',
          formatMessage(oldMessages.privacyPolicyNotAcceptedError),
          (value) => !!value
        ),
      }),
    [formatMessage]
  );

  const methods = useForm({
    mode: 'onSubmit',
    defaultValues: DEFAULT_VALUES,
    resolver: yupResolver(schema),
  });

  if (isNilOrError(locale)) return null;

  const handleSubmit = ({ email }: FormValues) => {
    onSubmit(email, locale);
  };

  return (
    <>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleSubmit)}>
          <Text mt="0px" mb="32px">
            {formatMessage(messages.enterYourEmailAddress)}
          </Text>
          <Box>
            <Input
              name="email"
              type="email"
              label={formatMessage(messages.email)}
            />
          </Box>
          <Box mt="24px">
            <Checkbox
              name="termsAndConditionsAccepted"
              label={
                <ConsentText>
                  <FormattedMessage
                    {...oldMessages.iHaveReadAndAgreeTo}
                    values={{
                      link: (
                        <Link target="_blank" to="/pages/terms-and-conditions">
                          <FormattedMessage
                            {...oldMessages.theTermsAndConditions}
                          />
                        </Link>
                      ),
                    }}
                  />
                </ConsentText>
              }
            />
            <Box mt="8px">
              <Checkbox
                name="privacyPolicyAccepted"
                label={
                  <ConsentText>
                    <FormattedMessage
                      {...oldMessages.iHaveReadAndAgreeTo}
                      values={{
                        link: (
                          <Link target="_blank" to="/pages/privacy-policy">
                            <FormattedMessage
                              {...oldMessages.thePrivacyPolicy}
                            />
                          </Link>
                        ),
                      }}
                    />
                  </ConsentText>
                }
              />
            </Box>
          </Box>
          <Text mt="24px" mb="0px" fontSize="s">
            {formatMessage(messages.byContinuing)}
          </Text>
          <Box w="100%" display="flex" mt="32px">
            <Button
              type="submit"
              width="100%"
              disabled={loading}
              processing={loading}
            >
              {formatMessage(sharedMessages.continue)}
            </Button>
          </Box>
        </form>
      </FormProvider>
      <SSOButtons onClickSSO={onSwitchToSSO} />
    </>
  );
};

export default EmailSignUp;
